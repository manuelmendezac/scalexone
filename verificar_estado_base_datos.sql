-- =====================================================
-- SCRIPT DE VERIFICACIÓN DEL ESTADO DE LA BASE DE DATOS
-- Ejecuta este script en Supabase para ver qué tablas existen
-- =====================================================

-- 1. Verificar tablas principales del marketplace
SELECT 
  'servicios_marketplace' as tabla,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'servicios_marketplace') 
    THEN '✅ EXISTE' 
    ELSE '❌ FALTA - Ejecutar: crear_tabla_servicios_marketplace.sql' 
  END as estado;

-- 2. Verificar tablas del sistema de afiliados
SELECT 
  tabla,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = tabla) 
    THEN '✅ EXISTE' 
    ELSE '❌ FALTA - Ejecutar: sistema_afiliados_comunidad_completo.sql' 
  END as estado
FROM (VALUES 
  ('codigos_afiliado'),
  ('clicks_afiliado'),
  ('conversiones_afiliado'),
  ('comisiones_afiliado'),
  ('config_comisiones')
) AS t(tabla);

-- 3. Verificar campos específicos de suscripciones en servicios_marketplace
SELECT 
  'Campos suscripciones en servicios_marketplace' as verificacion,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'servicios_marketplace' 
      AND column_name = 'tipo_producto'
    ) 
    THEN '✅ CAMPOS DE SUSCRIPCIÓN EXISTEN' 
    ELSE '❌ FALTAN CAMPOS - Ejecutar: integrar_suscripciones_marketplace.sql' 
  END as estado;

-- 4. Verificar buckets de storage
SELECT 
  'Buckets de storage' as verificacion,
  CASE 
    WHEN EXISTS (SELECT FROM storage.buckets WHERE id = 'servicios-marketplace') 
    THEN '✅ BUCKET servicios-marketplace EXISTE' 
    ELSE '❌ FALTA BUCKET - Ejecutar: crear_tabla_servicios_marketplace.sql' 
  END as estado;

-- 5. Contar datos existentes
SELECT 
  'Datos en servicios_marketplace' as tabla,
  COALESCE(
    (SELECT COUNT(*)::text FROM servicios_marketplace), 
    'Tabla no existe'
  ) || ' registros' as cantidad;

SELECT 
  'Suscripciones en marketplace' as tabla,
  COALESCE(
    (SELECT COUNT(*)::text FROM servicios_marketplace WHERE tipo_producto = 'suscripcion'), 
    '0'
  ) || ' suscripciones' as cantidad;

-- 6. Verificar configuración de comisiones
SELECT 
  'Configuración de comisiones' as tabla,
  COALESCE(
    (SELECT COUNT(*)::text FROM config_comisiones), 
    'Tabla no existe'
  ) || ' tipos de comisión configurados' as cantidad;

-- =====================================================
-- RESUMEN DE SCRIPTS NECESARIOS:
-- =====================================================
-- Si ves ❌ FALTA, ejecuta estos scripts EN ORDEN:

-- 1. crear_tabla_servicios_marketplace.sql (si servicios_marketplace no existe)
-- 2. sistema_afiliados_comunidad_completo.sql (si tablas de afiliados no existen)  
-- 3. integrar_suscripciones_marketplace.sql (ya ejecutado)
-- 4. crear_suscripcion_ejemplo_marketplace.sql (ya ejecutado)

-- ===================================================== 