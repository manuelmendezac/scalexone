-- Script para actualizar tabla planes_suscripcion con campos avanzados
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna moneda si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'planes_suscripcion' AND column_name = 'moneda') THEN
        ALTER TABLE planes_suscripcion ADD COLUMN moneda VARCHAR(3) DEFAULT 'USD';
    END IF;
END $$;

-- 2. Actualizar columna configuracion para incluir nuevos campos
DO $$
BEGIN
    -- Asegurar que la columna configuracion existe y es JSONB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'planes_suscripcion' AND column_name = 'configuracion') THEN
        ALTER TABLE planes_suscripcion ADD COLUMN configuracion JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. Agregar columna orden si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'planes_suscripcion' AND column_name = 'orden') THEN
        ALTER TABLE planes_suscripcion ADD COLUMN orden INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. Asegurar que la columna limites existe y es JSONB
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'planes_suscripcion' AND column_name = 'limites') THEN
        ALTER TABLE planes_suscripcion ADD COLUMN limites JSONB DEFAULT '{}';
    END IF;
END $$;

-- 5. Actualizar planes existentes con estructura mejorada
UPDATE planes_suscripcion 
SET configuracion = COALESCE(configuracion, '{}') 
WHERE configuracion IS NULL;

UPDATE planes_suscripcion 
SET limites = COALESCE(limites, '{}') 
WHERE limites IS NULL;

-- 6. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_planes_suscripcion_moneda ON planes_suscripcion(moneda);
CREATE INDEX IF NOT EXISTS idx_planes_suscripcion_orden ON planes_suscripcion(orden);
CREATE INDEX IF NOT EXISTS idx_planes_suscripcion_activo ON planes_suscripcion(activo);
CREATE INDEX IF NOT EXISTS idx_planes_suscripcion_comunidad_activo ON planes_suscripcion(comunidad_id, activo);

-- 7. Crear función para obtener planes con configuración completa
CREATE OR REPLACE FUNCTION get_planes_con_configuracion(p_comunidad_id UUID)
RETURNS TABLE (
    id UUID,
    comunidad_id UUID,
    nombre TEXT,
    descripcion TEXT,
    precio DECIMAL(10,2),
    moneda VARCHAR(3),
    duracion_dias INTEGER,
    caracteristicas TEXT[],
    limites JSONB,
    configuracion JSONB,
    activo BOOLEAN,
    orden INTEGER,
    fecha_creacion TIMESTAMP,
    fecha_actualizacion TIMESTAMP
) 
LANGUAGE sql
AS $$
    SELECT 
        p.id,
        p.comunidad_id,
        p.nombre,
        p.descripcion,
        p.precio,
        COALESCE(p.moneda, 'USD') as moneda,
        p.duracion_dias,
        COALESCE(p.caracteristicas, ARRAY[]::TEXT[]) as caracteristicas,
        COALESCE(p.limites, '{}'::JSONB) as limites,
        COALESCE(p.configuracion, '{}'::JSONB) as configuracion,
        p.activo,
        COALESCE(p.orden, 0) as orden,
        p.fecha_creacion,
        p.fecha_actualizacion
    FROM planes_suscripcion p 
    WHERE p.comunidad_id = p_comunidad_id
    ORDER BY p.orden ASC, p.nombre ASC;
$$;

-- 8. Función para crear plan con validaciones
CREATE OR REPLACE FUNCTION crear_plan_validado(
    p_comunidad_id UUID,
    p_nombre TEXT,
    p_descripcion TEXT DEFAULT NULL,
    p_precio DECIMAL(10,2),
    p_moneda VARCHAR(3) DEFAULT 'USD',
    p_duracion_dias INTEGER,
    p_caracteristicas TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_limites JSONB DEFAULT '{}',
    p_configuracion JSONB DEFAULT '{}',
    p_activo BOOLEAN DEFAULT TRUE,
    p_orden INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    nuevo_plan_id UUID;
BEGIN
    -- Validaciones
    IF p_nombre IS NULL OR LENGTH(TRIM(p_nombre)) = 0 THEN
        RAISE EXCEPTION 'El nombre del plan es obligatorio';
    END IF;
    
    IF p_precio < 0 THEN
        RAISE EXCEPTION 'El precio no puede ser negativo';
    END IF;
    
    IF p_duracion_dias <= 0 THEN
        RAISE EXCEPTION 'La duración debe ser mayor a 0 días';
    END IF;
    
    -- Verificar que no existe otro plan con el mismo nombre en la comunidad
    IF EXISTS (SELECT 1 FROM planes_suscripcion 
               WHERE comunidad_id = p_comunidad_id 
               AND LOWER(TRIM(nombre)) = LOWER(TRIM(p_nombre))) THEN
        RAISE EXCEPTION 'Ya existe un plan con ese nombre en esta comunidad';
    END IF;
    
    -- Crear el plan
    INSERT INTO planes_suscripcion (
        comunidad_id,
        nombre,
        descripcion,
        precio,
        moneda,
        duracion_dias,
        caracteristicas,
        limites,
        configuracion,
        activo,
        orden
    ) VALUES (
        p_comunidad_id,
        TRIM(p_nombre),
        p_descripcion,
        p_precio,
        UPPER(p_moneda),
        p_duracion_dias,
        p_caracteristicas,
        p_limites,
        p_configuracion,
        p_activo,
        p_orden
    )
    RETURNING id INTO nuevo_plan_id;
    
    RETURN nuevo_plan_id;
END;
$$;

-- 9. Actualizar RLS policies para incluir nuevas columnas
DROP POLICY IF EXISTS "usuarios_pueden_ver_planes_de_su_comunidad" ON planes_suscripcion;
CREATE POLICY "usuarios_pueden_ver_planes_de_su_comunidad" ON planes_suscripcion
    FOR SELECT USING (
        comunidad_id IN (
            SELECT c.id FROM comunidades c 
            WHERE c.id = auth.uid()::text::uuid 
            OR c.owner_id = auth.uid()
            OR c.is_public = true
        )
    );

DROP POLICY IF EXISTS "admins_pueden_gestionar_planes" ON planes_suscripcion;
CREATE POLICY "admins_pueden_gestionar_planes" ON planes_suscripcion
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            JOIN comunidades c ON c.id::text = u.community_id 
            WHERE u.id = auth.uid() 
            AND c.id = planes_suscripcion.comunidad_id
            AND (u.rol = 'admin' OR c.owner_id = auth.uid())
        )
    );

-- 10. Crear trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_planes_suscripcion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_planes_suscripcion_timestamp ON planes_suscripcion;
CREATE TRIGGER update_planes_suscripcion_timestamp
    BEFORE UPDATE ON planes_suscripcion
    FOR EACH ROW
    EXECUTE FUNCTION update_planes_suscripcion_timestamp();

-- 11. Insertar algunos planes de ejemplo para ScaleXOne (solo si no existen)
DO $$
DECLARE
    scalexone_comunidad_id UUID;
BEGIN
    -- Buscar la comunidad ScaleXOne
    SELECT id INTO scalexone_comunidad_id 
    FROM comunidades 
    WHERE slug = 'scalexone' OR nombre ILIKE '%scalexone%'
    LIMIT 1;
    
    IF scalexone_comunidad_id IS NOT NULL THEN
        -- Plan Básico (solo si no existe)
        IF NOT EXISTS (SELECT 1 FROM planes_suscripcion 
                       WHERE comunidad_id = scalexone_comunidad_id 
                       AND nombre = 'Plan Básico') THEN
            INSERT INTO planes_suscripcion (
                comunidad_id, nombre, descripcion, precio, moneda, duracion_dias,
                caracteristicas, limites, configuracion, activo, orden
            ) VALUES (
                scalexone_comunidad_id,
                'Plan Básico',
                'Acceso básico a todas las funcionalidades de ScaleXOne',
                29.99,
                'USD',
                30,
                ARRAY['Acceso a módulos básicos', 'Soporte por email', '1 usuario'],
                '{"usuarios": 1, "storage_gb": 5}',
                '{"categoria": "basico", "prueba_gratis": true, "duracion_prueba": 7, "tipo_prueba": "dia", "destacado": false, "color": "#3B82F6"}',
                true,
                1
            );
        END IF;
        
        -- Plan Pro (solo si no existe)
        IF NOT EXISTS (SELECT 1 FROM planes_suscripcion 
                       WHERE comunidad_id = scalexone_comunidad_id 
                       AND nombre = 'Plan Pro') THEN
            INSERT INTO planes_suscripcion (
                comunidad_id, nombre, descripcion, precio, moneda, duracion_dias,
                caracteristicas, limites, configuracion, activo, orden
            ) VALUES (
                scalexone_comunidad_id,
                'Plan Pro',
                'Funcionalidades avanzadas para profesionales',
                99.99,
                'USD',
                30,
                ARRAY['Todos los módulos', 'Soporte prioritario', '5 usuarios', 'IA avanzada'],
                '{"usuarios": 5, "storage_gb": 50}',
                '{"categoria": "premium", "prueba_gratis": true, "duracion_prueba": 14, "tipo_prueba": "dia", "destacado": true, "color": "#F59E0B"}',
                true,
                2
            );
        END IF;
        
        -- Plan Enterprise (solo si no existe)
        IF NOT EXISTS (SELECT 1 FROM planes_suscripcion 
                       WHERE comunidad_id = scalexone_comunidad_id 
                       AND nombre = 'Plan Enterprise') THEN
            INSERT INTO planes_suscripcion (
                comunidad_id, nombre, descripcion, precio, moneda, duracion_dias,
                caracteristicas, limites, configuracion, activo, orden
            ) VALUES (
                scalexone_comunidad_id,
                'Plan Enterprise',
                'Solución completa para empresas y equipos grandes',
                299.99,
                'USD',
                30,
                ARRAY['Acceso completo', 'Soporte 24/7', 'Usuarios ilimitados', 'Marca blanca'],
                '{"usuarios": -1, "storage_gb": 500}',
                '{"categoria": "enterprise", "prueba_gratis": true, "duracion_prueba": 30, "tipo_prueba": "dia", "destacado": false, "color": "#8B5CF6"}',
                true,
                3
            );
        END IF;
        
        RAISE NOTICE 'Planes de ejemplo creados para ScaleXOne (comunidad_id: %)', scalexone_comunidad_id;
    ELSE
        RAISE NOTICE 'No se encontró la comunidad ScaleXone, no se crearon planes de ejemplo';
    END IF;
END $$;

-- 12. Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' 
ORDER BY ordinal_position;

-- Mostrar resumen
SELECT 
    'Script ejecutado correctamente' as status,
    COUNT(*) as total_planes,
    COUNT(CASE WHEN activo THEN 1 END) as planes_activos
FROM planes_suscripcion; 