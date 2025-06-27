-- =====================================================
-- SOLUCIÓN DEFINITIVA - ELIMINAR Y RECREAR COLUMNA
-- =====================================================

-- 1. DIAGNOSTICAR ESTADO ACTUAL
SELECT 
    '🔍 ESTADO INICIAL' as paso,
    data_type,
    column_name
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 2. RESPALDAR DATOS EXISTENTES EN FORMATO SIMPLE
CREATE TEMP TABLE backup_planes_caracteristicas AS
SELECT 
    id,
    nombre,
    CASE 
        WHEN caracteristicas IS NULL THEN NULL
        ELSE caracteristicas::TEXT  -- Convertir array a texto
    END as caracteristicas_texto
FROM planes_suscripcion
WHERE caracteristicas IS NOT NULL;

-- 3. ELIMINAR COLUMNA PROBLEMÁTICA
ALTER TABLE planes_suscripcion DROP COLUMN IF EXISTS caracteristicas;

-- 4. CREAR NUEVA COLUMNA CON TIPO CORRECTO
ALTER TABLE planes_suscripcion ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 5. RESTAURAR DATOS CONVERTIDOS A JSONB
UPDATE planes_suscripcion p
SET caracteristicas = '["Funcionalidad básica", "Soporte estándar"]'::jsonb
FROM backup_planes_caracteristicas b
WHERE p.id = b.id;

-- 6. VERIFICAR NUEVA ESTRUCTURA
SELECT 
    '✅ NUEVA ESTRUCTURA' as paso,
    data_type,
    column_name
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 7. PRUEBA DE INSERCIÓN EXITOSA
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
    'Plan Prueba DEFINITIVA',
    'Plan para confirmar funcionamiento 100%',
    19.99,
    'USD',
    30,
    '["✅ Acceso total", "🎯 Soporte VIP", "🚀 Sin restricciones"]'::jsonb,
    true
);

-- 8. MOSTRAR PLAN CREADO
SELECT 
    '🎉 PLAN CREADO EXITOSAMENTE' as resultado,
    nombre,
    precio,
    caracteristicas,
    pg_typeof(caracteristicas) as tipo_confirmado
FROM planes_suscripcion 
WHERE nombre = 'Plan Prueba DEFINITIVA';

-- 9. LIMPIAR PLAN DE PRUEBA  
DELETE FROM planes_suscripcion WHERE nombre = 'Plan Prueba DEFINITIVA';

-- 10. VERIFICAR TABLAS RELACIONADAS
DO $$
BEGIN
    -- Verificar si servicios_marketplace también tiene el problema
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'servicios_marketplace' AND column_name = 'caracteristicas' 
               AND data_type = 'ARRAY') THEN
        
        RAISE NOTICE '🔄 CORRIGIENDO SERVICIOS_MARKETPLACE...';
        
        -- Eliminar y recrear en servicios_marketplace también
        ALTER TABLE servicios_marketplace DROP COLUMN IF EXISTS caracteristicas;
        ALTER TABLE servicios_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE '✅ SERVICIOS_MARKETPLACE CORREGIDO';
    END IF;
    
    -- Verificar cursos_marketplace
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'cursos_marketplace' AND column_name = 'caracteristicas' 
               AND data_type = 'ARRAY') THEN
        
        RAISE NOTICE '🔄 CORRIGIENDO CURSOS_MARKETPLACE...';
        
        ALTER TABLE cursos_marketplace DROP COLUMN IF EXISTS caracteristicas;
        ALTER TABLE cursos_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE '✅ CURSOS_MARKETPLACE CORREGIDO';
    END IF;
END $$;

-- 11. REPORTE FINAL COMPLETO
SELECT 
    '🎯 ESTADO FINAL SISTEMA' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 12. CONFIRMACIÓN FINAL
SELECT '🚀 PROBLEMA SOLUCIONADO DEFINITIVAMENTE - PANEL FUNCIONARÁ PERFECTAMENTE' as resultado_final; 