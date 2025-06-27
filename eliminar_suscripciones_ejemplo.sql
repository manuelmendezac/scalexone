-- =====================================================
-- ELIMINAR SUSCRIPCIONES DE EJEMPLO - SCALEXONE
-- =====================================================

-- 1. Eliminar las suscripciones de ejemplo del marketplace
DELETE FROM cursos_marketplace 
WHERE instructor = 'ScaleXone' 
  AND (nombre LIKE '%Premium%' OR titulo LIKE '%Premium%');

DELETE FROM servicios_marketplace 
WHERE proveedor = 'ScaleXone' 
  AND (nombre LIKE '%Premium%' OR titulo LIKE '%Premium%');

-- 2. Eliminar los planes de suscripción de ejemplo
DELETE FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
  AND (nombre LIKE '%Premium%');

-- 3. Eliminar cualquier suscripción activa de ejemplo
DELETE FROM suscripciones 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

-- 4. Verificar que se eliminaron
SELECT 
  'Ejemplos eliminados correctamente' as mensaje,
  (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_restantes,
  (SELECT COUNT(*) FROM suscripciones WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as suscripciones_restantes;
