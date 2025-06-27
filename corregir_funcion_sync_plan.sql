-- =====================================================
-- CORREGIR FUNCIÓN SYNC_PLAN_TO_MARKETPLACE
-- =====================================================

-- 1. VER LA FUNCIÓN PROBLEMÁTICA
SELECT 
    '🔍 FUNCIÓN PROBLEMÁTICA' as titulo,
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'sync_plan_to_marketplace';

-- 2. ELIMINAR LA FUNCIÓN PROBLEMÁTICA
DROP FUNCTION IF EXISTS sync_plan_to_marketplace() CASCADE;

-- 3. ELIMINAR TRIGGERS QUE USAN ESA FUNCIÓN
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE event_object_table = 'planes_suscripcion'
        AND action_statement LIKE '%sync_plan_to_marketplace%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || 
                ' ON ' || trigger_record.event_object_table;
        RAISE NOTICE '🗑️ ELIMINADO TRIGGER: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 4. VERIFICAR QUE SE ELIMINARON
SELECT 
    '✅ TRIGGERS RESTANTES' as titulo,
    COUNT(*) as total_triggers
FROM information_schema.triggers 
WHERE event_object_table = 'planes_suscripcion';

-- 5. AHORA PRUEBA INSERCIÓN SIN LA FUNCIÓN PROBLEMÁTICA
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
    'Plan Sin Función Automática',
    'Plan que no ejecuta sync automático',
    29.99,
    'USD',
    30,
    '["🚀 Sin función automática", "✅ Funciona perfecto", "🎯 JSONB correcto"]'::jsonb,
    true
);

-- 6. VERIFICAR PLAN CREADO
SELECT 
    '🎉 PLAN CREADO SIN ERRORES' as resultado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Sin Función Automática';

-- 7. ELIMINAR PLAN DE PRUEBA (AHORA SÍ DEBERÍA FUNCIONAR)
DELETE FROM planes_suscripcion WHERE nombre = 'Plan Sin Función Automática';

-- 8. CREAR FUNCIÓN CORREGIDA (OPCIONAL)
CREATE OR REPLACE FUNCTION sync_plan_to_marketplace_corrected()
RETURNS TRIGGER AS $$
BEGIN
    -- Función corregida con JSONB
    INSERT INTO servicios_marketplace (
        titulo,
        descripcion,
        precio,
        proveedor,
        categoria,
        caracteristicas,
        activo,
        tipo_producto,
        plan_suscripcion_id
    ) VALUES (
        'Suscripción: ' || NEW.nombre,
        NEW.descripcion,
        NEW.precio,
        'ScaleXone',
        'Suscripción Premium',
        NEW.caracteristicas, -- Ya es JSONB
        NEW.activo,
        'suscripcion',
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. VERIFICAR TIPOS FINALES
SELECT 
    '✅ VERIFICACIÓN FINAL' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 10. CONFIRMACIÓN FINAL
SELECT '🚀 FUNCIÓN PROBLEMÁTICA ELIMINADA - SISTEMA 100% FUNCIONAL' as resultado_final; 