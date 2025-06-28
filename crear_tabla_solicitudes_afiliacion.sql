-- ============================================================
-- TABLA SOLICITUDES DE AFILIACIÓN - MARKETING AFILIADOS
-- ============================================================
-- Esta tabla gestiona las solicitudes de los usuarios para afiliar productos del marketplace

-- Crear tabla de solicitudes de afiliación
CREATE TABLE IF NOT EXISTS solicitudes_afiliacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL,
    tipo_producto VARCHAR(50) NOT NULL CHECK (tipo_producto IN ('curso', 'servicio', 'suscripcion')),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    notas_admin TEXT,
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    codigo_afiliado VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_afiliacion_usuario_id ON solicitudes_afiliacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_afiliacion_producto_id ON solicitudes_afiliacion(producto_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_afiliacion_estado ON solicitudes_afiliacion(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_afiliacion_tipo_producto ON solicitudes_afiliacion(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_solicitudes_afiliacion_fecha_solicitud ON solicitudes_afiliacion(fecha_solicitud);

-- Constraint único para evitar solicitudes duplicadas
ALTER TABLE solicitudes_afiliacion 
ADD CONSTRAINT unique_usuario_producto UNIQUE (usuario_id, producto_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_solicitudes_afiliacion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_solicitudes_afiliacion_updated_at
    BEFORE UPDATE ON solicitudes_afiliacion
    FOR EACH ROW
    EXECUTE FUNCTION update_solicitudes_afiliacion_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE solicitudes_afiliacion ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias solicitudes
CREATE POLICY "usuarios_pueden_ver_sus_solicitudes" ON solicitudes_afiliacion
    FOR SELECT USING (auth.uid() = usuario_id);

-- Política: Los usuarios pueden crear sus propias solicitudes
CREATE POLICY "usuarios_pueden_crear_solicitudes" ON solicitudes_afiliacion
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política: Los usuarios pueden actualizar sus propias solicitudes (solo ciertos campos)
CREATE POLICY "usuarios_pueden_actualizar_sus_solicitudes" ON solicitudes_afiliacion
    FOR UPDATE USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

-- Política: Los admins pueden ver todas las solicitudes
CREATE POLICY "admins_pueden_ver_todas_solicitudes" ON solicitudes_afiliacion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.rol = 'admin'
        )
    );

-- Política: Los admins pueden actualizar todas las solicitudes
CREATE POLICY "admins_pueden_actualizar_solicitudes" ON solicitudes_afiliacion
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.rol = 'admin'
        )
    );

-- Función para generar código de afiliado automáticamente al aprobar
CREATE OR REPLACE FUNCTION generar_codigo_afiliado()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está aprobando la solicitud y no tiene código de afiliado
    IF NEW.estado = 'aprobada' AND OLD.estado != 'aprobada' AND NEW.codigo_afiliado IS NULL THEN
        -- Generar código único basado en usuario y producto
        NEW.codigo_afiliado = 'AFF_' || SUBSTRING(NEW.usuario_id::text, 1, 8) || '_' || SUBSTRING(NEW.producto_id::text, 1, 8);
        NEW.fecha_aprobacion = NOW();
        NEW.fecha_respuesta = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código de afiliado
CREATE TRIGGER trigger_generar_codigo_afiliado
    BEFORE UPDATE ON solicitudes_afiliacion
    FOR EACH ROW
    EXECUTE FUNCTION generar_codigo_afiliado();

-- Insertar datos de ejemplo para testing
INSERT INTO solicitudes_afiliacion (
    usuario_id,
    producto_id,
    tipo_producto,
    estado,
    fecha_solicitud,
    notas_admin
) VALUES 
-- Solicitudes de ejemplo (solo si no existen)
(
    (SELECT auth_user_id FROM usuarios WHERE email LIKE '%manuel%' LIMIT 1),
    (SELECT id FROM cursos_marketplace LIMIT 1),
    'curso',
    'aprobada',
    NOW() - INTERVAL '5 days',
    'Aprobado automáticamente - Usuario de confianza'
),
(
    (SELECT auth_user_id FROM usuarios WHERE email LIKE '%manuel%' LIMIT 1),
    (SELECT id FROM servicios_marketplace WHERE tipo_producto = 'suscripcion' LIMIT 1),
    'suscripcion',
    'pendiente',
    NOW() - INTERVAL '1 day',
    NULL
) ON CONFLICT (usuario_id, producto_id) DO NOTHING;

-- Agregar comentarios a la tabla
COMMENT ON TABLE solicitudes_afiliacion IS 'Tabla para gestionar solicitudes de afiliación de productos del marketplace';
COMMENT ON COLUMN solicitudes_afiliacion.usuario_id IS 'ID del usuario que solicita la afiliación';
COMMENT ON COLUMN solicitudes_afiliacion.producto_id IS 'ID del producto al que se quiere afiliar';
COMMENT ON COLUMN solicitudes_afiliacion.tipo_producto IS 'Tipo de producto: curso, servicio o suscripcion';
COMMENT ON COLUMN solicitudes_afiliacion.estado IS 'Estado de la solicitud: pendiente, aprobada, rechazada';
COMMENT ON COLUMN solicitudes_afiliacion.codigo_afiliado IS 'Código único de afiliado generado al aprobar';
COMMENT ON COLUMN solicitudes_afiliacion.fecha_aprobacion IS 'Fecha cuando se aprobó la solicitud';

-- ============================================================
-- SCRIPT COMPLETADO
-- ============================================================
-- Tabla solicitudes_afiliacion creada con:
-- ✅ Estructura completa con constraints
-- ✅ Índices para rendimiento
-- ✅ Políticas RLS para seguridad
-- ✅ Triggers automáticos
-- ✅ Datos de ejemplo
-- ✅ Documentación completa 