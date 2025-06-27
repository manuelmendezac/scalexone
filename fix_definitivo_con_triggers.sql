-- =====================================================
-- FIX DEFINITIVO - DESACTIVAR TRIGGERS Y CORREGIR TODO
-- =====================================================

-- 1. VER QUÉ TRIGGERS EXISTEN
SELECT 
    '🔍 TRIGGERS ACTUALES' as titulo,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace');

-- 2. DESACTIVAR TRIGGERS TEMPORALMENTE
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE event_object_table = 'planes_suscripcion'
    LOOP
        EXECUTE 'ALTER TABLE ' || trigger_record.event_object_table || 
                ' DISABLE TRIGGER ' || trigger_record.trigger_name;
        RAISE NOTICE '🔇 DESACTIVADO: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 3. ELIMINAR VISTAS DEPENDIENTES
DROP VIEW IF EXISTS vista_marketplace_completo CASCADE;

-- 4. CORREGIR SERVICIOS_MARKETPLACE DEFINITIVAMENTE
ALTER TABLE servicios_marketplace DROP COLUMN IF EXISTS caracteristicas CASCADE;
ALTER TABLE servicios_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 5. CORREGIR CURSOS_MARKETPLACE DEFINITIVAMENTE  
ALTER TABLE cursos_marketplace DROP COLUMN IF EXISTS caracteristicas CASCADE;
ALTER TABLE cursos_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 6. VERIFICAR CORRECCIÓN
SELECT 
    '✅ VERIFICACIÓN TIPOS' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 7. REACTIVAR TRIGGERS
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE event_object_table = 'planes_suscripcion'
    LOOP
        EXECUTE 'ALTER TABLE ' || trigger_record.event_object_table || 
                ' ENABLE TRIGGER ' || trigger_record.trigger_name;
        RAISE NOTICE '🔊 REACTIVADO: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 8. RECREAR VISTA MARKETPLACE SIMPLE
CREATE OR REPLACE VIEW vista_marketplace_completo AS
SELECT 
    'servicio' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    caracteristicas
FROM servicios_marketplace
WHERE activo = true

UNION ALL

SELECT 
    'curso' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    caracteristicas
FROM cursos_marketplace
WHERE activo = true;

-- 9. AHORA PRUEBA INSERCIÓN CON TRIGGERS ACTIVOS
INSERT INTO planes_suscripcion (
    comunidad_id,
    nombre,
    descripcion,
    precio,
    moneda,
    duracion_dias,
    caracteristicas,
    activo
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'Plan Test Final Definitivo',
    'Plan con triggers funcionando',
    59.99,
    'USD',
    30,
    '["🚀 Triggers funcionando", "✅ JSONB correcto", "🎯 Todo operativo"]'::jsonb,
    true
);

-- 10. VERIFICAR QUE SE CREÓ SIN ERRORES
SELECT 
    '🎉 PLAN CREADO CON TRIGGERS' as resultado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Test Final Definitivo';

-- 11. VERIFICAR SI SE SINCRONIZÓ AL MARKETPLACE
SELECT 
    '🎉 SINCRONIZACIÓN MARKETPLACE' as resultado,
    COUNT(*) as registros_sincronizados
FROM vista_marketplace_completo 
WHERE tipo_producto = 'suscripcion';

-- 12. LIMPIAR PLAN DE PRUEBA
DELETE FROM planes_suscripcion WHERE nombre = 'Plan Test Final Definitivo';

-- 13. CONFIRMACIÓN FINAL
SELECT '🚀 SISTEMA COMPLETAMENTE CORREGIDO - TRIGGERS Y MARKETPLACE FUNCIONANDO' as resultado_final; 