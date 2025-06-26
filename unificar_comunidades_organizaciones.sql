-- =====================================================
-- UNIFICACIÓN DE COMUNIDADES Y ORGANIZACIONES
-- Extendemos la tabla comunidades para que funcione como organizaciones
-- =====================================================

-- 1. EXTENDER TABLA COMUNIDADES CON CAMPOS PARA MARCA BLANCA
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS dominio_personalizado VARCHAR(255);
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS configuracion JSONB DEFAULT '{}';
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'suspendida', 'cancelada'));
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. CREAR SLUG AUTOMÁTICO PARA COMUNIDADES EXISTENTES
UPDATE comunidades 
SET slug = LOWER(REGEXP_REPLACE(nombre, '[^a-zA-Z0-9]', '-', 'g'))
WHERE slug IS NULL;

-- Para scalexone como primera comunidad
UPDATE comunidades 
SET slug = 'scalexone' 
WHERE nombre ILIKE '%scalex%' OR nombre ILIKE '%default%' 
AND slug IS NULL;

-- 3. CREAR ÍNDICES PARA LA TABLA COMUNIDADES EXTENDIDA
CREATE INDEX IF NOT EXISTS idx_comunidades_slug ON comunidades(slug);
CREATE INDEX IF NOT EXISTS idx_comunidades_estado ON comunidades(estado);
CREATE INDEX IF NOT EXISTS idx_comunidades_owner ON comunidades(owner_id);

-- 4. CREAR TRIGGER PARA ACTUALIZAR fecha_actualizacion
CREATE OR REPLACE FUNCTION update_comunidades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comunidades_timestamp ON comunidades;
CREATE TRIGGER update_comunidades_timestamp
    BEFORE UPDATE ON comunidades
    FOR EACH ROW
    EXECUTE FUNCTION update_comunidades_updated_at();

-- 5. MODIFICAR TABLA PLANES_SUSCRIPCION PARA USAR COMUNIDADES
-- Cambiar referencia de organizacion_id a comunidad_id
ALTER TABLE planes_suscripcion DROP CONSTRAINT IF EXISTS planes_suscripcion_organizacion_id_fkey;
ALTER TABLE planes_suscripcion RENAME COLUMN organizacion_id TO comunidad_id;
ALTER TABLE planes_suscripcion ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
    FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 6. MODIFICAR TABLA SUSCRIPCIONES PARA USAR COMUNIDADES
ALTER TABLE suscripciones DROP CONSTRAINT IF EXISTS suscripciones_organizacion_id_fkey;
ALTER TABLE suscripciones RENAME COLUMN organizacion_id TO comunidad_id;
ALTER TABLE suscripciones ADD CONSTRAINT suscripciones_comunidad_id_fkey 
    FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 7. MODIFICAR TABLA TRANSACCIONES_SUSCRIPCION PARA USAR COMUNIDADES
ALTER TABLE transacciones_suscripcion DROP CONSTRAINT IF EXISTS transacciones_suscripcion_organizacion_id_fkey;
ALTER TABLE transacciones_suscripcion RENAME COLUMN organizacion_id TO comunidad_id;
ALTER TABLE transacciones_suscripcion ADD CONSTRAINT transacciones_suscripcion_comunidad_id_fkey 
    FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 8. MODIFICAR TABLA CODIGOS_DESCUENTO PARA USAR COMUNIDADES
ALTER TABLE codigos_descuento DROP CONSTRAINT IF EXISTS codigos_descuento_organizacion_id_fkey;
ALTER TABLE codigos_descuento RENAME COLUMN organizacion_id TO comunidad_id;
ALTER TABLE codigos_descuento ADD CONSTRAINT codigos_descuento_comunidad_id_fkey 
    FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 9. ACTUALIZAR ÍNDICES PARA USAR comunidad_id
-- Planes
DROP INDEX IF EXISTS idx_planes_organizacion;
CREATE INDEX IF NOT EXISTS idx_planes_comunidad ON planes_suscripcion(comunidad_id);

-- Suscripciones
DROP INDEX IF EXISTS idx_suscripciones_organizacion;
DROP INDEX IF EXISTS idx_suscripciones_usuario;
DROP INDEX IF EXISTS idx_suscripciones_estado;
CREATE INDEX IF NOT EXISTS idx_suscripciones_comunidad ON suscripciones(comunidad_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario ON suscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_fechas ON suscripciones(fecha_inicio, fecha_fin);

-- Transacciones
DROP INDEX IF EXISTS idx_transacciones_organizacion;
DROP INDEX IF EXISTS idx_transacciones_usuario;
DROP INDEX IF EXISTS idx_transacciones_estado;
CREATE INDEX IF NOT EXISTS idx_transacciones_comunidad ON transacciones_suscripcion(comunidad_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON transacciones_suscripcion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones_suscripcion(estado);

-- Códigos de descuento
DROP INDEX IF EXISTS idx_codigos_organizacion;
CREATE INDEX IF NOT EXISTS idx_codigos_comunidad ON codigos_descuento(comunidad_id);
CREATE INDEX IF NOT EXISTS idx_codigos_codigo ON codigos_descuento(codigo);

-- 10. CREAR COMUNIDAD SCALEXONE SI NO EXISTE
INSERT INTO comunidades (
    id,
    nombre, 
    slug, 
    descripcion, 
    logo_url,
    is_public,
    estado,
    configuracion
) VALUES (
    gen_random_uuid(),
    'ScaleXOne',
    'scalexone',
    'Plataforma principal de ScaleXOne - Primera comunidad del ecosistema',
    'https://sylentfqkidyhkcpqgpaq.supabase.co/storage/v1/object/public/templates/logoneuroclonhorizontal.svg',
    true,
    'activa',
    '{"es_principal": true, "marca_blanca": true, "configuracion_suscripciones": {"activo": true}}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    configuracion = EXCLUDED.configuracion,
    estado = EXCLUDED.estado;

-- 11. CREAR VISTAS ACTUALIZADAS PARA SUSCRIPCIONES
DROP VIEW IF EXISTS vista_suscripciones_activas;
CREATE VIEW vista_suscripciones_activas AS
SELECT 
    s.id,
    s.usuario_id,
    u.name as usuario_nombre,
    u.email as usuario_email,
    s.comunidad_id,
    c.nombre as comunidad_nombre,
    c.slug as comunidad_slug,
    s.plan_id,
    p.nombre as plan_nombre,
    p.precio as plan_precio,
    s.estado,
    s.fecha_inicio,
    s.fecha_fin,
    s.renovacion_automatica,
    s.precio_pagado,
    s.descuento_aplicado
FROM suscripciones s
JOIN usuarios u ON s.usuario_id = u.id
JOIN comunidades c ON s.comunidad_id = c.id
JOIN planes_suscripcion p ON s.plan_id = p.id
WHERE s.estado IN ('activa', 'trial');

DROP VIEW IF EXISTS vista_estadisticas_comunidad;
CREATE VIEW vista_estadisticas_comunidad AS
SELECT 
    c.id as comunidad_id,
    c.nombre as comunidad_nombre,
    c.slug as comunidad_slug,
    COUNT(DISTINCT s.usuario_id) as total_suscriptores,
    COUNT(DISTINCT CASE WHEN s.estado = 'activa' THEN s.usuario_id END) as suscriptores_activos,
    COUNT(DISTINCT p.id) as total_planes,
    COALESCE(SUM(CASE WHEN t.estado = 'completada' THEN t.monto ELSE 0 END), 0) as ingresos_totales,
    COALESCE(SUM(CASE 
        WHEN t.estado = 'completada' 
        AND t.fecha_procesamiento >= CURRENT_DATE - INTERVAL '30 days' 
        THEN t.monto 
        ELSE 0 
    END), 0) as ingresos_mes_actual
FROM comunidades c
LEFT JOIN suscripciones s ON c.id = s.comunidad_id
LEFT JOIN planes_suscripcion p ON c.id = p.comunidad_id AND p.activo = true
LEFT JOIN transacciones_suscripcion t ON c.id = t.comunidad_id
GROUP BY c.id, c.nombre, c.slug;

-- 12. ACTUALIZAR POLÍTICAS RLS PARA USAR COMUNIDADES
-- Primero habilitamos RLS en todas las tablas
ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_descuento ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_suscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas para planes_suscripcion
DROP POLICY IF EXISTS "Usuarios ven planes de su comunidad" ON planes_suscripcion;
DROP POLICY IF EXISTS "Admins gestionan planes de su comunidad" ON planes_suscripcion;

CREATE POLICY "Usuarios ven planes de su comunidad" ON planes_suscripcion
    FOR SELECT USING (
        comunidad_id IN (
            SELECT u.community_id::uuid 
            FROM usuarios u 
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Admins gestionan planes de su comunidad" ON planes_suscripcion
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM usuarios u 
            JOIN comunidades c ON u.community_id::uuid = c.id
            WHERE c.id = planes_suscripcion.comunidad_id 
            AND u.rol IN ('admin', 'superadmin')
        )
    );

-- Políticas para suscripciones
DROP POLICY IF EXISTS "Usuarios ven sus propias suscripciones" ON suscripciones;
DROP POLICY IF EXISTS "Admins ven suscripciones de su comunidad" ON suscripciones;

CREATE POLICY "Usuarios ven sus propias suscripciones" ON suscripciones
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Admins ven suscripciones de su comunidad" ON suscripciones
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM usuarios u 
            JOIN comunidades c ON u.community_id::uuid = c.id
            WHERE c.id = suscripciones.comunidad_id 
            AND u.rol IN ('admin', 'superadmin')
        )
    );

-- Políticas para transacciones
DROP POLICY IF EXISTS "Usuarios ven sus transacciones" ON transacciones_suscripcion;
DROP POLICY IF EXISTS "Admins ven transacciones de su comunidad" ON transacciones_suscripcion;

CREATE POLICY "Usuarios ven sus transacciones" ON transacciones_suscripcion
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Admins ven transacciones de su comunidad" ON transacciones_suscripcion
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM usuarios u 
            JOIN comunidades c ON u.community_id::uuid = c.id
            WHERE c.id = transacciones_suscripcion.comunidad_id 
            AND u.rol IN ('admin', 'superadmin')
        )
    );

-- Políticas para códigos de descuento
DROP POLICY IF EXISTS "Usuarios ven códigos de su comunidad" ON codigos_descuento;
DROP POLICY IF EXISTS "Admins gestionan códigos de su comunidad" ON codigos_descuento;

CREATE POLICY "Usuarios ven códigos de su comunidad" ON codigos_descuento
    FOR SELECT USING (
        comunidad_id IN (
            SELECT u.community_id::uuid 
            FROM usuarios u 
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Admins gestionan códigos de su comunidad" ON codigos_descuento
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM usuarios u 
            JOIN comunidades c ON u.community_id::uuid = c.id
            WHERE c.id = codigos_descuento.comunidad_id 
            AND u.rol IN ('admin', 'superadmin')
        )
    );

-- 13. FUNCIÓN PARA OBTENER COMUNIDAD POR COMMUNITY_ID (COMPATIBILIDAD)
CREATE OR REPLACE FUNCTION get_comunidad_by_community_id(community_id_param TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    comunidad_uuid UUID;
BEGIN
    -- Buscar comunidad existente por slug o nombre
    SELECT id INTO comunidad_uuid 
    FROM comunidades 
    WHERE slug = community_id_param 
    OR LOWER(nombre) = LOWER(community_id_param);
    
    -- Si no existe, crear una nueva comunidad
    IF comunidad_uuid IS NULL THEN
        INSERT INTO comunidades (nombre, slug, descripcion, is_public, estado)
        VALUES (
            INITCAP(community_id_param),
            LOWER(community_id_param),
            'Comunidad creada automáticamente',
            true,
            'activa'
        )
        RETURNING id INTO comunidad_uuid;
    END IF;
    
    RETURN comunidad_uuid;
END;
$$;

-- 14. INSERTAR PLANES DE EJEMPLO PARA SCALEXONE
WITH scalexone_comunidad AS (
    SELECT id FROM comunidades WHERE slug = 'scalexone' LIMIT 1
)
INSERT INTO planes_suscripcion (
    comunidad_id, nombre, descripcion, precio, moneda, duracion_dias, 
    caracteristicas, activo, orden
) 
SELECT 
    sc.id,
    plan_data.nombre,
    plan_data.descripcion,
    plan_data.precio,
    'USD',
    plan_data.duracion_dias,
    plan_data.caracteristicas::jsonb,
    true,
    plan_data.orden
FROM scalexone_comunidad sc,
(VALUES 
    ('Pro', 'Plan profesional con acceso completo', 29.99, 30, '["Acceso a todos los módulos", "Soporte prioritario", "Certificaciones"]', 1),
    ('Business', 'Plan empresarial con herramientas avanzadas', 99.99, 30, '["Todo lo del plan Pro", "Herramientas de equipo", "Análisis avanzados", "API Access"]', 2),
    ('White Label', 'Solución completa de marca blanca', 299.99, 30, '["Todo lo del plan Business", "Marca blanca completa", "Subdominios personalizados", "Soporte dedicado"]', 3)
) AS plan_data(nombre, descripcion, precio, duracion_dias, caracteristicas, orden)
ON CONFLICT DO NOTHING;

-- 15. COMENTARIOS FINALES
COMMENT ON TABLE comunidades IS 'Tabla unificada que funciona como organizaciones/marcas blancas para el sistema de suscripciones';
COMMENT ON COLUMN comunidades.slug IS 'Identificador único para URLs y referencias de API';
COMMENT ON COLUMN comunidades.dominio_personalizado IS 'Dominio personalizado para la marca blanca';
COMMENT ON COLUMN comunidades.configuracion IS 'Configuraciones específicas de la marca blanca';

-- Verificar que todo se creó correctamente
SELECT 
    'Comunidades creadas' as tipo,
    COUNT(*) as cantidad
FROM comunidades
UNION ALL
SELECT 
    'Planes creados' as tipo,
    COUNT(*) as cantidad
FROM planes_suscripcion; 