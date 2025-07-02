-- SISTEMA DE RETIROS DE AFILIADOS PARA SCALEXONE
-- Script completo para implementar gestión de retiros de afiliados

-- 1. TABLA DE RETIROS DE AFILIADOS
CREATE TABLE IF NOT EXISTS retiros_afiliados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    afiliado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    comunidad_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'pagado', 'cancelado')),
    metodo_pago TEXT NOT NULL DEFAULT 'transferencia' CHECK (metodo_pago IN ('transferencia', 'paypal', 'stripe', 'crypto', 'otro')),
    referencia_pago TEXT,
    datos_pago JSONB DEFAULT '{}',
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    aprobado_por UUID REFERENCES usuarios(id),
    motivo_rechazo TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE CONFIGURACIÓN DE RETIROS POR COMUNIDAD
CREATE TABLE IF NOT EXISTS config_retiros_comunidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE UNIQUE,
    monto_minimo DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    monto_maximo DECIMAL(10,2) NOT NULL DEFAULT 10000.00,
    metodos_pago_disponibles TEXT[] DEFAULT ARRAY['transferencia', 'paypal'],
    dias_procesamiento INTEGER DEFAULT 3,
    comision_retiro DECIMAL(5,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. FUNCIONES PARA GESTIÓN DE RETIROS

-- Función para verificar si un afiliado puede solicitar retiro
CREATE OR REPLACE FUNCTION verificar_retiro_disponible(
    p_afiliado_id UUID,
    p_comunidad_id UUID,
    p_monto DECIMAL
)
RETURNS TABLE(
    puede_retirar BOOLEAN,
    saldo_disponible DECIMAL,
    mensaje TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_saldo_disponible DECIMAL;
    v_config config_retiros_comunidad%ROWTYPE;
    v_retiros_pendientes INTEGER;
BEGIN
    -- Obtener configuración de la comunidad
    SELECT * INTO v_config
    FROM config_retiros_comunidad
    WHERE comunidad_id = p_comunidad_id AND activo = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::DECIMAL, 'Configuración de retiros no encontrada para esta comunidad';
        RETURN;
    END IF;
    
    -- Calcular saldo disponible (comisiones ganadas - retiros ya procesados)
    SELECT COALESCE(SUM(ca.monto), 0) - COALESCE(SUM(ra.monto), 0)
    INTO v_saldo_disponible
    FROM comisiones_afiliado ca
    LEFT JOIN retiros_afiliados ra ON ra.afiliado_id = ca.afiliado_id 
        AND ra.estado IN ('aprobado', 'pagado')
        AND ra.comunidad_id = p_comunidad_id
    WHERE ca.afiliado_id = p_afiliado_id 
        AND ca.estado = 'ganada'
        AND ca.comunidad_id = p_comunidad_id;
    
    -- Verificar retiros pendientes
    SELECT COUNT(*) INTO v_retiros_pendientes
    FROM retiros_afiliados
    WHERE afiliado_id = p_afiliado_id 
        AND comunidad_id = p_comunidad_id
        AND estado = 'pendiente';
    
    -- Validaciones
    IF p_monto < v_config.monto_minimo THEN
        RETURN QUERY SELECT false, v_saldo_disponible, 
            format('Monto mínimo para retiro: $%s', v_config.monto_minimo);
        RETURN;
    END IF;
    
    IF p_monto > v_config.monto_maximo THEN
        RETURN QUERY SELECT false, v_saldo_disponible, 
            format('Monto máximo para retiro: $%s', v_config.monto_maximo);
        RETURN;
    END IF;
    
    IF p_monto > v_saldo_disponible THEN
        RETURN QUERY SELECT false, v_saldo_disponible, 
            format('Saldo insuficiente. Disponible: $%s', v_saldo_disponible);
        RETURN;
    END IF;
    
    IF v_retiros_pendientes > 0 THEN
        RETURN QUERY SELECT false, v_saldo_disponible, 
            'Ya tienes un retiro pendiente. Espera a que se procese.';
        RETURN;
    END IF;
    
    RETURN QUERY SELECT true, v_saldo_disponible, 'Retiro disponible';
END;
$$;

-- Función para solicitar retiro
CREATE OR REPLACE FUNCTION solicitar_retiro_afiliado(
    p_afiliado_id UUID,
    p_comunidad_id UUID,
    p_monto DECIMAL,
    p_metodo_pago TEXT DEFAULT 'transferencia',
    p_datos_pago JSONB DEFAULT '{}'
)
RETURNS TABLE(
    exito BOOLEAN,
    retiro_id UUID,
    mensaje TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_verificacion RECORD;
    v_retiro_id UUID;
BEGIN
    -- Verificar si puede retirar
    SELECT * INTO v_verificacion
    FROM verificar_retiro_disponible(p_afiliado_id, p_comunidad_id, p_monto);
    
    IF NOT v_verificacion.puede_retirar THEN
        RETURN QUERY SELECT false, NULL::UUID, v_verificacion.mensaje;
        RETURN;
    END IF;
    
    -- Crear solicitud de retiro
    INSERT INTO retiros_afiliados (
        afiliado_id, comunidad_id, monto, metodo_pago, datos_pago
    ) VALUES (
        p_afiliado_id, p_comunidad_id, p_monto, p_metodo_pago, p_datos_pago
    ) RETURNING id INTO v_retiro_id;
    
    RETURN QUERY SELECT true, v_retiro_id, 'Retiro solicitado exitosamente';
END;
$$;

-- Función para aprobar/rechazar retiro (solo admins)
CREATE OR REPLACE FUNCTION procesar_retiro_afiliado(
    p_retiro_id UUID,
    p_estado TEXT,
    p_admin_id UUID,
    p_motivo_rechazo TEXT DEFAULT NULL,
    p_referencia_pago TEXT DEFAULT NULL
)
RETURNS TABLE(
    exito BOOLEAN,
    mensaje TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_retiro retiros_afiliados%ROWTYPE;
BEGIN
    -- Verificar que el admin existe y es admin
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = p_admin_id AND rol = 'admin') THEN
        RETURN QUERY SELECT false, 'No tienes permisos para procesar retiros';
        RETURN;
    END IF;
    
    -- Obtener retiro
    SELECT * INTO v_retiro
    FROM retiros_afiliados
    WHERE id = p_retiro_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Retiro no encontrado';
        RETURN;
    END IF;
    
    IF v_retiro.estado != 'pendiente' THEN
        RETURN QUERY SELECT false, 'El retiro ya fue procesado';
        RETURN;
    END IF;
    
    -- Actualizar retiro
    UPDATE retiros_afiliados
    SET 
        estado = p_estado,
        aprobado_por = p_admin_id,
        fecha_aprobacion = CASE WHEN p_estado IN ('aprobado', 'rechazado') THEN now() ELSE fecha_aprobacion END,
        fecha_pago = CASE WHEN p_estado = 'pagado' THEN now() ELSE fecha_pago END,
        motivo_rechazo = CASE WHEN p_estado = 'rechazado' THEN p_motivo_rechazo ELSE motivo_rechazo END,
        referencia_pago = CASE WHEN p_estado = 'pagado' THEN p_referencia_pago ELSE referencia_pago END,
        updated_at = now()
    WHERE id = p_retiro_id;
    
    RETURN QUERY SELECT true, format('Retiro %s exitosamente', p_estado);
END;
$$;

-- 4. VISTAS PARA REPORTES

-- Vista de estadísticas de retiros por comunidad
CREATE OR REPLACE VIEW estadisticas_retiros_comunidad AS
SELECT 
    rc.comunidad_id,
    c.nombre as nombre_comunidad,
    COUNT(ra.id) as total_retiros,
    COUNT(CASE WHEN ra.estado = 'pendiente' THEN 1 END) as retiros_pendientes,
    COUNT(CASE WHEN ra.estado = 'aprobado' THEN 1 END) as retiros_aprobados,
    COUNT(CASE WHEN ra.estado = 'pagado' THEN 1 END) as retiros_pagados,
    COUNT(CASE WHEN ra.estado = 'rechazado' THEN 1 END) as retiros_rechazados,
    SUM(CASE WHEN ra.estado IN ('aprobado', 'pagado') THEN ra.monto ELSE 0 END) as monto_total_procesado,
    SUM(CASE WHEN ra.estado = 'pendiente' THEN ra.monto ELSE 0 END) as monto_pendiente,
    AVG(CASE WHEN ra.estado IN ('aprobado', 'pagado') THEN ra.monto END) as monto_promedio
FROM comunidades c
LEFT JOIN retiros_afiliados ra ON c.id = ra.comunidad_id
LEFT JOIN config_retiros_comunidad rc ON c.id = rc.comunidad_id
GROUP BY rc.comunidad_id, c.nombre;

-- Vista de retiros con información detallada
CREATE OR REPLACE VIEW retiros_detallados AS
SELECT 
    ra.id,
    ra.afiliado_id,
    u.nombre as nombre_afiliado,
    u.email as email_afiliado,
    ra.comunidad_id,
    c.nombre as nombre_comunidad,
    ra.monto,
    ra.estado,
    ra.metodo_pago,
    ra.referencia_pago,
    ra.fecha_solicitud,
    ra.fecha_aprobacion,
    ra.fecha_pago,
    ra.aprobado_por,
    admin.nombre as nombre_admin,
    ra.motivo_rechazo,
    ra.datos_pago,
    ra.metadata,
    ra.created_at,
    ra.updated_at
FROM retiros_afiliados ra
JOIN usuarios u ON ra.afiliado_id = u.id
JOIN comunidades c ON ra.comunidad_id = c.id
LEFT JOIN usuarios admin ON ra.aprobado_por = admin.id;

-- 5. TRIGGERS PARA ACTUALIZAR TIMESTAMPS

-- Trigger para actualizar updated_at en retiros_afiliados
CREATE TRIGGER update_retiros_afiliados_updated_at
    BEFORE UPDATE ON retiros_afiliados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en config_retiros_comunidad
CREATE TRIGGER update_config_retiros_comunidad_updated_at
    BEFORE UPDATE ON config_retiros_comunidad
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. POLÍTICAS DE SEGURIDAD

ALTER TABLE retiros_afiliados ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_retiros_comunidad ENABLE ROW LEVEL SECURITY;

-- Políticas para retiros_afiliados
CREATE POLICY "Afiliados pueden ver sus propios retiros" ON retiros_afiliados
    FOR SELECT
    USING (afiliado_id = auth.uid());

CREATE POLICY "Afiliados pueden crear sus propios retiros" ON retiros_afiliados
    FOR INSERT
    WITH CHECK (afiliado_id = auth.uid());

CREATE POLICY "Admins pueden ver todos los retiros de su comunidad" ON retiros_afiliados
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM usuarios 
            WHERE rol = 'admin' 
            AND comunidad_id = retiros_afiliados.comunidad_id
        )
    );

CREATE POLICY "Admins pueden actualizar retiros de su comunidad" ON retiros_afiliados
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM usuarios 
            WHERE rol = 'admin' 
            AND comunidad_id = retiros_afiliados.comunidad_id
        )
    );

-- Políticas para config_retiros_comunidad
CREATE POLICY "Admins pueden gestionar configuración de su comunidad" ON config_retiros_comunidad
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM usuarios 
            WHERE rol = 'admin' 
            AND comunidad_id = config_retiros_comunidad.comunidad_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM usuarios 
            WHERE rol = 'admin' 
            AND comunidad_id = config_retiros_comunidad.comunidad_id
        )
    );

-- 7. ÍNDICES PARA OPTIMIZAR RENDIMIENTO

CREATE INDEX IF NOT EXISTS idx_retiros_afiliados_afiliado_id ON retiros_afiliados(afiliado_id);
CREATE INDEX IF NOT EXISTS idx_retiros_afiliados_comunidad_id ON retiros_afiliados(comunidad_id);
CREATE INDEX IF NOT EXISTS idx_retiros_afiliados_estado ON retiros_afiliados(estado);
CREATE INDEX IF NOT EXISTS idx_retiros_afiliados_fecha_solicitud ON retiros_afiliados(fecha_solicitud);
CREATE INDEX IF NOT EXISTS idx_retiros_afiliados_aprobado_por ON retiros_afiliados(aprobado_por);
CREATE INDEX IF NOT EXISTS idx_config_retiros_comunidad_id ON config_retiros_comunidad(comunidad_id);

-- 8. DATOS INICIALES

-- Insertar configuración por defecto para la comunidad ScaleXone
INSERT INTO config_retiros_comunidad (
    comunidad_id, 
    monto_minimo, 
    monto_maximo, 
    metodos_pago_disponibles, 
    dias_procesamiento,
    comision_retiro
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1', -- UUID de la comunidad ScaleXone
    50.00,
    10000.00,
    ARRAY['transferencia', 'paypal', 'stripe'],
    3,
    0.00
) ON CONFLICT (comunidad_id) DO NOTHING;

-- 9. MENSAJE DE CONFIRMACIÓN
SELECT 
    'Sistema de retiros de afiliados instalado exitosamente' as mensaje,
    COUNT(*) as tablas_creadas
FROM information_schema.tables 
WHERE table_name IN ('retiros_afiliados', 'config_retiros_comunidad'); 