-- =====================================================
-- DIAGNÓSTICO Y CORRECCIÓN USUARIO HOMODEUS
-- Script para diagnosticar y resolver el problema de acceso
-- =====================================================

-- 1. VERIFICAR ESTADO ACTUAL DEL USUARIO
SELECT 'VERIFICANDO USUARIO' as paso;
SELECT 
  id, email, name, community_id, rol, created_at
FROM usuarios 
WHERE email = 'homodeus.cith@gmail.com';

-- 2. VERIFICAR COMUNIDADES EXISTENTES
SELECT 'VERIFICANDO COMUNIDADES' as paso;
SELECT 
  id, nombre, slug, owner_id, is_public, created_at
FROM comunidades 
ORDER BY created_at;

-- 3. VERIFICAR SI SCALEXONE EXISTE
SELECT 'VERIFICANDO SCALEXONE' as paso;
SELECT 
  id, nombre, slug, owner_id, is_public
FROM comunidades 
WHERE slug = 'scalexone' OR nombre ILIKE '%scalex%';

-- 4. CREAR/ACTUALIZAR COMUNIDAD SCALEXONE SI NO EXISTE CORRECTAMENTE
DO $$
DECLARE
    usuario_homodeus_id uuid;
    scalexone_id uuid;
BEGIN
    -- Obtener ID del usuario homodeus
    SELECT id INTO usuario_homodeus_id 
    FROM usuarios 
    WHERE email = 'homodeus.cith@gmail.com';
    
    IF usuario_homodeus_id IS NULL THEN
        RAISE NOTICE 'Usuario homodeus.cith@gmail.com no encontrado';
        RETURN;
    END IF;
    
    -- Verificar si ScaleXOne existe
    SELECT id INTO scalexone_id 
    FROM comunidades 
    WHERE slug = 'scalexone';
    
    -- Si no existe, crear ScaleXOne
    IF scalexone_id IS NULL THEN
        INSERT INTO comunidades (
            nombre, slug, descripcion, is_public, owner_id,
            configuracion, estado, created_at, fecha_creacion
        ) VALUES (
            'ScaleXOne',
            'scalexone', 
            'Comunidad principal de ScaleXOne - Plataforma de crecimiento empresarial',
            true,
            usuario_homodeus_id,
            '{"tipo": "principal", "marca_blanca": true}',
            'activa',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING id INTO scalexone_id;
        
        RAISE NOTICE 'Comunidad ScaleXOne creada con ID: %', scalexone_id;
    ELSE
        -- Si existe pero no tiene el owner correcto, actualizarlo
        UPDATE comunidades 
        SET owner_id = usuario_homodeus_id,
            descripcion = 'Comunidad principal de ScaleXOne - Plataforma de crecimiento empresarial',
            is_public = true,
            configuracion = COALESCE(configuracion, '{}') || '{"tipo": "principal", "marca_blanca": true}'
        WHERE id = scalexone_id;
        
        RAISE NOTICE 'Comunidad ScaleXOne actualizada. Owner: %', usuario_homodeus_id;
    END IF;
    
    -- Actualizar community_id del usuario para que apunte a ScaleXOne
    UPDATE usuarios 
    SET community_id = 'scalexone',
        rol = COALESCE(rol, 'admin')  -- Asegurar que sea admin
    WHERE email = 'homodeus.cith@gmail.com';
    
    RAISE NOTICE 'Usuario homodeus actualizado: community_id=scalexone, rol=admin';
    
END $$;

-- 5. VERIFICAR RESULTADO FINAL
SELECT 'RESULTADO FINAL - USUARIO' as paso;
SELECT 
  id, email, name, community_id, rol, created_at
FROM usuarios 
WHERE email = 'homodeus.cith@gmail.com';

SELECT 'RESULTADO FINAL - COMUNIDAD SCALEXONE' as paso;
SELECT 
  id, nombre, slug, owner_id, is_public, descripcion, configuracion
FROM comunidades 
WHERE slug = 'scalexone';

-- 6. VERIFICAR PLANES DE SUSCRIPCIÓN PARA SCALEXONE
SELECT 'PLANES DE SUSCRIPCIÓN SCALEXONE' as paso;
SELECT 
  ps.id, ps.nombre, ps.precio, ps.activo, c.nombre as comunidad_nombre
FROM planes_suscripcion ps
JOIN comunidades c ON ps.comunidad_id = c.id
WHERE c.slug = 'scalexone';

-- 7. CREAR PLANES DE EJEMPLO SI NO EXISTEN
INSERT INTO planes_suscripcion (
    comunidad_id, nombre, descripcion, precio, moneda, duracion_dias, 
    caracteristicas, activo, orden
) 
SELECT 
    c.id,
    plan_data.nombre,
    plan_data.descripcion,
    plan_data.precio,
    'USD',
    plan_data.duracion_dias,
    plan_data.caracteristicas::jsonb,
    true,
    plan_data.orden
FROM comunidades c,
(VALUES 
    ('Básico', 'Plan básico para emprendedores', 29.99, 30, '["Acceso a módulos básicos", "Soporte por email", "Comunidad"]', 1),
    ('Pro', 'Plan profesional con acceso completo', 99.99, 30, '["Acceso completo", "Soporte prioritario", "Certificaciones", "Herramientas avanzadas"]', 2),
    ('Enterprise', 'Solución empresarial completa', 299.99, 30, '["Todo lo del plan Pro", "Marca blanca", "Subdominios", "Soporte dedicado", "API Access"]', 3)
) AS plan_data(nombre, descripcion, precio, duracion_dias, caracteristicas, orden)
WHERE c.slug = 'scalexone'
ON CONFLICT DO NOTHING;

-- 8. VERIFICACIÓN FINAL DE PLANES
SELECT 'VERIFICACIÓN FINAL - PLANES CREADOS' as paso;
SELECT 
  ps.nombre, ps.precio, ps.activo, ps.descripcion
FROM planes_suscripcion ps
JOIN comunidades c ON ps.comunidad_id = c.id
WHERE c.slug = 'scalexone'
ORDER BY ps.orden; 