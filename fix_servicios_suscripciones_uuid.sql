-- =====================================================
-- CORRECCIÓN SERVICIOS SUSCRIPCIONES - UUID SCALEXONE
-- Corrige los servicios que consultan con 'scalexone' string
-- =====================================================

-- 1. Actualizar todos los registros que usan 'scalexone' como community_id
UPDATE suscripciones 
SET comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
WHERE comunidad_id = 'scalexone';

-- 2. Actualizar planes_suscripcion que usan 'scalexone'
UPDATE planes_suscripcion 
SET comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
WHERE comunidad_id = 'scalexone';

-- 3. Actualizar usuarios que tengan community_id como 'scalexone'
UPDATE usuarios 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
WHERE community_id = 'scalexone';

-- 4. Verificar que la comunidad ScaleXone existe con el UUID correcto
INSERT INTO comunidades (
    id,
    nombre,
    slug,
    descripcion,
    is_public,
    created_at
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
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

-- 5. Crear función que siempre retorne el UUID correcto para ScaleXone
CREATE OR REPLACE FUNCTION get_scalexone_uuid()
RETURNS UUID AS $$
BEGIN
    RETURN '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;
END;
$$ LANGUAGE plpgsql;

-- 6. Mensaje de confirmación
SELECT 
    'Servicios suscripciones corregidos - UUID ScaleXone aplicado' as mensaje,
    (SELECT COUNT(*) FROM suscripciones WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as suscripciones_corregidas,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_corregidos;
