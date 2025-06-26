-- =====================================================
-- SISTEMA DE SUSCRIPCIONES CON MARCA BLANCA
-- =====================================================

-- 1. TABLA DE ORGANIZACIONES/MARCAS BLANCAS
CREATE TABLE IF NOT EXISTS organizaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- Identificador único para la marca blanca
    descripcion TEXT,
    logo_url TEXT,
    dominio_personalizado VARCHAR(255),
    configuracion JSONB DEFAULT '{}', -- Configuraciones específicas de la marca
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'suspendida', 'cancelada')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PLANES DE SUSCRIPCIÓN (POR ORGANIZACIÓN)
CREATE TABLE IF NOT EXISTS planes_suscripcion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    duracion_dias INTEGER NOT NULL DEFAULT 30,
    caracteristicas JSONB DEFAULT '[]', -- Array de características del plan
    limites JSONB DEFAULT '{}', -- Límites del plan (usuarios, storage, etc.)
    configuracion JSONB DEFAULT '{}', -- Configuraciones específicas del plan
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0, -- Para ordenar los planes
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE SUSCRIPCIONES
CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES planes_suscripcion(id) ON DELETE RESTRICT,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'pausada', 'vencida', 'trial')),
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_cancelacion TIMESTAMP WITH TIME ZONE,
    razon_cancelacion TEXT,
    renovacion_automatica BOOLEAN DEFAULT true,
    precio_pagado DECIMAL(10,2), -- Precio que se pagó (puede diferir del precio actual)
    descuento_aplicado DECIMAL(5,2) DEFAULT 0, -- Porcentaje de descuento aplicado
    metadata JSONB DEFAULT '{}', -- Datos adicionales de la suscripción
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE TRANSACCIONES/PAGOS
CREATE TABLE IF NOT EXISTS transacciones_suscripcion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE CASCADE,
    organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'fallida', 'reembolsada')),
    metodo_pago VARCHAR(50), -- 'stripe', 'paypal', 'transferencia', etc.
    referencia_externa VARCHAR(255), -- ID de la transacción en el proveedor de pago
    datos_pago JSONB DEFAULT '{}', -- Datos adicionales del pago
    fecha_procesamiento TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE CÓDIGOS DE DESCUENTO
CREATE TABLE IF NOT EXISTS codigos_descuento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'porcentaje' CHECK (tipo IN ('porcentaje', 'monto_fijo')),
    valor DECIMAL(10,2) NOT NULL, -- Porcentaje (0-100) o monto fijo
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    usos_maximos INTEGER,
    usos_actuales INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    planes_aplicables UUID[], -- Array de IDs de planes donde aplica
    metadata JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organizacion_id, codigo)
);

-- 6. TABLA DE HISTORIAL DE CAMBIOS DE SUSCRIPCIÓN
CREATE TABLE IF NOT EXISTS historial_suscripciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL, -- 'creada', 'renovada', 'cancelada', 'pausada', 'reanudada', 'plan_cambiado'
    plan_anterior_id UUID REFERENCES planes_suscripcion(id),
    plan_nuevo_id UUID REFERENCES planes_suscripcion(id),
    detalles JSONB DEFAULT '{}',
    realizada_por UUID REFERENCES usuarios(id), -- Usuario que realizó la acción
    fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para organizaciones
CREATE INDEX IF NOT EXISTS idx_organizaciones_slug ON organizaciones(slug);
CREATE INDEX IF NOT EXISTS idx_organizaciones_estado ON organizaciones(estado);

-- Índices para planes
CREATE INDEX IF NOT EXISTS idx_planes_organizacion ON planes_suscripcion(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_planes_activo ON planes_suscripcion(activo);

-- Índices para suscripciones
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario ON suscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_organizacion ON suscripciones(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_fecha_fin ON suscripciones(fecha_fin);

-- Índices para transacciones
CREATE INDEX IF NOT EXISTS idx_transacciones_suscripcion ON transacciones_suscripcion(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_organizacion ON transacciones_suscripcion(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones_suscripcion(estado);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER trigger_organizaciones_updated_at
    BEFORE UPDATE ON organizaciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_planes_updated_at
    BEFORE UPDATE ON planes_suscripcion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_suscripciones_updated_at
    BEFORE UPDATE ON suscripciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Función para verificar vencimiento de suscripciones
CREATE OR REPLACE FUNCTION verificar_suscripciones_vencidas()
RETURNS void AS $$
BEGIN
    UPDATE suscripciones 
    SET estado = 'vencida'
    WHERE estado = 'activa' 
    AND fecha_fin < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_descuento ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_suscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas para organizaciones (solo superadmin puede ver todas)
CREATE POLICY "Ver organizaciones" ON organizaciones
    FOR SELECT USING (
        auth.jwt() ->> 'rol' = 'superadmin' OR
        auth.jwt() ->> 'organizacion_id' = id::text
    );

CREATE POLICY "Crear organizaciones" ON organizaciones
    FOR INSERT WITH CHECK (auth.jwt() ->> 'rol' = 'superadmin');

CREATE POLICY "Actualizar organizaciones" ON organizaciones
    FOR UPDATE USING (
        auth.jwt() ->> 'rol' = 'superadmin' OR
        auth.jwt() ->> 'organizacion_id' = id::text
    );

-- Políticas para planes (cada organización ve solo sus planes)
CREATE POLICY "Ver planes" ON planes_suscripcion
    FOR SELECT USING (
        auth.jwt() ->> 'rol' = 'superadmin' OR
        auth.jwt() ->> 'organizacion_id' = organizacion_id::text
    );

CREATE POLICY "Gestionar planes" ON planes_suscripcion
    FOR ALL USING (
        auth.jwt() ->> 'rol' = 'superadmin' OR
        (auth.jwt() ->> 'organizacion_id' = organizacion_id::text AND
         auth.jwt() ->> 'rol' IN ('admin', 'organizacion_admin'))
    );

-- Políticas para suscripciones
CREATE POLICY "Ver suscripciones" ON suscripciones
    FOR SELECT USING (
        auth.jwt() ->> 'rol' = 'superadmin' OR
        auth.jwt() ->> 'organizacion_id' = organizacion_id::text OR
        auth.jwt() ->> 'user_id' = usuario_id::text
    );

CREATE POLICY "Gestionar suscripciones" ON suscripciones
    FOR ALL USING (
        auth.jwt() ->> 'rol' = 'superadmin' OR
        (auth.jwt() ->> 'organizacion_id' = organizacion_id::text AND
         auth.jwt() ->> 'rol' IN ('admin', 'organizacion_admin'))
    );

-- =====================================================
-- DATOS INICIALES DE EJEMPLO
-- =====================================================

-- Insertar organización de ejemplo
INSERT INTO organizaciones (nombre, slug, descripcion) VALUES 
('ScaleXOne', 'scalexone', 'Plataforma principal de ScaleXOne'),
('Demo Corp', 'democorp', 'Organización de demostración')
ON CONFLICT (slug) DO NOTHING;

-- Insertar planes de ejemplo para ScaleXOne
WITH org AS (SELECT id FROM organizaciones WHERE slug = 'scalexone' LIMIT 1)
INSERT INTO planes_suscripcion (organizacion_id, nombre, descripcion, precio, caracteristicas, limites) 
SELECT 
    org.id,
    'Basic',
    'Plan básico con funcionalidades esenciales',
    9.99,
    '["Acceso a cursos básicos", "Soporte por email", "5 GB de almacenamiento"]'::jsonb,
    '{"usuarios": 1, "storage_gb": 5, "cursos_basicos": true}'::jsonb
FROM org
UNION ALL
SELECT 
    org.id,
    'Pro',
    'Plan profesional con más funcionalidades',
    19.99,
    '["Todo de Basic", "Acceso a cursos avanzados", "Soporte prioritario", "50 GB de almacenamiento", "Certificaciones"]'::jsonb,
    '{"usuarios": 5, "storage_gb": 50, "cursos_avanzados": true, "certificaciones": true}'::jsonb
FROM org
UNION ALL
SELECT 
    org.id,
    'Premium',
    'Plan premium con todas las funcionalidades',
    29.99,
    '["Todo de Pro", "Acceso completo", "Soporte 24/7", "Almacenamiento ilimitado", "Mentorías 1:1", "Contenido exclusivo"]'::jsonb,
    '{"usuarios": -1, "storage_gb": -1, "mentorias": true, "contenido_exclusivo": true}'::jsonb
FROM org;

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista de suscripciones activas con información del plan
CREATE OR REPLACE VIEW vista_suscripciones_activas AS
SELECT 
    s.id,
    s.usuario_id,
    u.nombre as usuario_nombre,
    u.email as usuario_email,
    s.organizacion_id,
    o.nombre as organizacion_nombre,
    s.plan_id,
    p.nombre as plan_nombre,
    p.precio as plan_precio,
    s.estado,
    s.fecha_inicio,
    s.fecha_fin,
    s.precio_pagado,
    s.renovacion_automatica,
    CASE 
        WHEN s.fecha_fin < CURRENT_TIMESTAMP THEN 'vencida'
        ELSE s.estado 
    END as estado_actual
FROM suscripciones s
JOIN usuarios u ON s.usuario_id = u.id
JOIN organizaciones o ON s.organizacion_id = o.id
JOIN planes_suscripcion p ON s.plan_id = p.id;

-- Vista de estadísticas por organización
CREATE OR REPLACE VIEW vista_estadisticas_organizacion AS
SELECT 
    o.id as organizacion_id,
    o.nombre as organizacion_nombre,
    COUNT(s.id) as total_suscripciones,
    COUNT(CASE WHEN s.estado = 'activa' THEN 1 END) as suscripciones_activas,
    SUM(CASE WHEN s.estado = 'activa' THEN s.precio_pagado ELSE 0 END) as ingresos_mensuales,
    ROUND(
        (COUNT(CASE WHEN s.estado = 'activa' THEN 1 END)::decimal / 
         NULLIF(COUNT(s.id), 0) * 100), 2
    ) as tasa_retencion
FROM organizaciones o
LEFT JOIN suscripciones s ON o.id = s.organizacion_id
GROUP BY o.id, o.nombre; 