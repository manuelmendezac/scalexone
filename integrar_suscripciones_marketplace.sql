-- =====================================================
-- INTEGRACIÓN SUSCRIPCIONES → MARKETPLACE → AFILIADOS
-- =====================================================
-- Este script agrega los campos necesarios para que las suscripciones
-- aparezcan automáticamente en el marketplace y puedan ser promocionadas por afiliados

-- 1. Agregar campos específicos para suscripciones en servicios_marketplace
ALTER TABLE servicios_marketplace ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(20) DEFAULT 'servicio' CHECK (tipo_producto IN ('servicio', 'suscripcion'));
ALTER TABLE servicios_marketplace ADD COLUMN IF NOT EXISTS plan_suscripcion_id UUID REFERENCES planes_suscripcion(id) ON DELETE CASCADE;
ALTER TABLE servicios_marketplace ADD COLUMN IF NOT EXISTS duracion_dias INTEGER;
ALTER TABLE servicios_marketplace ADD COLUMN IF NOT EXISTS caracteristicas JSONB DEFAULT '[]';

-- 2. Agregar campos específicos para suscripciones en cursos_marketplace también (por consistencia)
ALTER TABLE cursos_marketplace ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(20) DEFAULT 'curso' CHECK (tipo_producto IN ('curso', 'suscripcion'));
ALTER TABLE cursos_marketplace ADD COLUMN IF NOT EXISTS plan_suscripcion_id UUID REFERENCES planes_suscripcion(id) ON DELETE CASCADE;
ALTER TABLE cursos_marketplace ADD COLUMN IF NOT EXISTS duracion_dias INTEGER;

-- 3. Actualizar la tabla solicitudes_partnership para incluir suscripciones
ALTER TABLE solicitudes_partnership 
ALTER COLUMN tipo_producto TYPE VARCHAR(20), 
ALTER COLUMN tipo_producto SET DEFAULT 'curso',
ADD CONSTRAINT check_tipo_producto CHECK (tipo_producto IN ('curso', 'servicio', 'suscripcion'));

-- 4. Actualizar la tabla partnerships_activos para incluir suscripciones
ALTER TABLE partnerships_activos 
ALTER COLUMN tipo_producto TYPE VARCHAR(20), 
ALTER COLUMN tipo_producto SET DEFAULT 'curso',
ADD CONSTRAINT check_tipo_producto_activos CHECK (tipo_producto IN ('curso', 'servicio', 'suscripcion'));

-- 5. Actualizar la tabla ventas_afiliados para incluir suscripciones
ALTER TABLE ventas_afiliados 
ALTER COLUMN tipo_producto TYPE VARCHAR(20), 
ALTER COLUMN tipo_producto SET DEFAULT 'curso',
ADD CONSTRAINT check_tipo_producto_ventas CHECK (tipo_producto IN ('curso', 'servicio', 'suscripcion'));

-- 6. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_servicios_marketplace_tipo_producto ON servicios_marketplace(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_servicios_marketplace_plan_suscripcion ON servicios_marketplace(plan_suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_cursos_marketplace_tipo_producto ON cursos_marketplace(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_solicitudes_partnership_tipo_producto ON solicitudes_partnership(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_partnerships_activos_tipo_producto ON partnerships_activos(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_ventas_afiliados_tipo_producto ON ventas_afiliados(tipo_producto);

-- 7. Función para sincronizar plan de suscripción con marketplace
CREATE OR REPLACE FUNCTION sincronizar_plan_marketplace()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se actualiza un plan de suscripción, actualizar el marketplace
    IF TG_OP = 'UPDATE' THEN
        UPDATE servicios_marketplace 
        SET 
            titulo = 'Suscripción ' || NEW.nombre,
            descripcion = COALESCE(NEW.descripcion, 'Plan de suscripción ' || NEW.nombre || ' con acceso completo a la plataforma'),
            precio = NEW.precio,
            activo = NEW.activo,
            updated_at = CURRENT_TIMESTAMP
        WHERE plan_suscripcion_id = NEW.id;
    END IF;
    
    -- Cuando se elimina un plan, eliminar del marketplace
    IF TG_OP = 'DELETE' THEN
        DELETE FROM servicios_marketplace WHERE plan_suscripcion_id = OLD.id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para sincronización automática
DROP TRIGGER IF EXISTS trigger_sincronizar_plan_marketplace ON planes_suscripcion;
CREATE TRIGGER trigger_sincronizar_plan_marketplace
    AFTER UPDATE OR DELETE ON planes_suscripcion
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_plan_marketplace();

-- 9. Actualizar configuración de comisiones por defecto para incluir suscripciones
INSERT INTO config_comisiones (
    community_id, 
    tipo_comision, 
    porcentaje_comision, 
    monto_fijo, 
    activo, 
    descripcion
) 
SELECT 
    community_id,
    'suscripcion_premium',
    30.0,
    0.0,
    true,
    'Comisión por venta de suscripciones premium'
FROM config_comisiones 
WHERE tipo_comision = 'premium' 
AND NOT EXISTS (
    SELECT 1 FROM config_comisiones cc2 
    WHERE cc2.community_id = config_comisiones.community_id 
    AND cc2.tipo_comision = 'suscripcion_premium'
)
GROUP BY community_id;

-- 10. Vista unificada para el marketplace (cursos + servicios + suscripciones)
CREATE OR REPLACE VIEW vista_marketplace_completo AS
SELECT 
    'curso' as origen,
    id,
    titulo,
    descripcion,
    precio,
    imagen_url,
    'ScaleXone' as proveedor,
    'Cursos' as categoria,
    rating,
    reviews,
    activo,
    afilible,
    niveles_comision,
    comision_nivel1,
    comision_nivel2,
    comision_nivel3,
    tipo_producto,
    plan_suscripcion_id,
    duracion_dias,
    NULL as caracteristicas,
    community_id,
    created_at,
    updated_at
FROM cursos_marketplace
WHERE activo = true

UNION ALL

SELECT 
    'servicio' as origen,
    id,
    titulo,
    descripcion,
    precio,
    imagen_url,
    proveedor,
    categoria,
    rating,
    reviews,
    activo,
    afilible,
    niveles_comision,
    comision_nivel1,
    comision_nivel2,
    comision_nivel3,
    tipo_producto,
    plan_suscripcion_id,
    duracion_dias,
    caracteristicas,
    community_id,
    created_at,
    updated_at
FROM servicios_marketplace
WHERE activo = true;

-- 11. Comentarios para documentación
COMMENT ON COLUMN servicios_marketplace.tipo_producto IS 'Tipo de producto: servicio o suscripcion';
COMMENT ON COLUMN servicios_marketplace.plan_suscripcion_id IS 'ID del plan de suscripción si tipo_producto = suscripcion';
COMMENT ON COLUMN servicios_marketplace.duracion_dias IS 'Duración en días para suscripciones';
COMMENT ON COLUMN servicios_marketplace.caracteristicas IS 'Array de características del producto/suscripción';

COMMENT ON VIEW vista_marketplace_completo IS 'Vista unificada del marketplace incluyendo cursos, servicios y suscripciones activos';

-- =====================================================
-- VERIFICACIÓN DE LA INTEGRACIÓN
-- =====================================================

-- Verificar que las tablas tienen los nuevos campos
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('servicios_marketplace', 'cursos_marketplace', 'solicitudes_partnership', 'partnerships_activos', 'ventas_afiliados')
AND column_name IN ('tipo_producto', 'plan_suscripcion_id', 'duracion_dias', 'caracteristicas')
ORDER BY table_name, column_name;

-- Verificar la vista del marketplace
SELECT COUNT(*) as total_productos_marketplace FROM vista_marketplace_completo; 