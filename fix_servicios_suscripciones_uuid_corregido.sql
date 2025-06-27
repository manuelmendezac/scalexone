-- =====================================================
-- CORRECCIÓN SERVICIOS SUSCRIPCIONES - UUID SCALEXONE CORREGIDO
-- Corrige los servicios usando TEXT en lugar de UUID
-- =====================================================

-- 1. Actualizar todos los registros que usan 'scalexone' como community_id (TEXT)
UPDATE suscripciones 
SET comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
WHERE comunidad_id = 'scalexone';

-- 2. Actualizar planes_suscripcion que usan 'scalexone' (TEXT)
UPDATE planes_suscripcion 
SET comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
WHERE comunidad_id = 'scalexone';

-- 3. Actualizar usuarios que tengan community_id como 'scalexone' (TEXT)
UPDATE usuarios 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
WHERE community_id = 'scalexone';

-- 4. Asegurar que la comunidad ScaleXone existe con el UUID correcto
INSERT INTO comunidades (
    id,
    nombre,
    slug,
    descripcion,
    is_public,
    created_at
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid,
    'ScaleXOne',
    'scalexone',
    'Plataforma principal de crecimiento empresarial',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    descripcion = EXCLUDED.descripcion,
    is_public = EXCLUDED.is_public;

-- 5. Verificar estructura de tablas y datos
SELECT 
    'Script ejecutado correctamente' as mensaje,
    (SELECT COUNT(*) FROM suscripciones WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as suscripciones_uuid,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_uuid,
    (SELECT COUNT(*) FROM usuarios WHERE community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as usuarios_uuid;
