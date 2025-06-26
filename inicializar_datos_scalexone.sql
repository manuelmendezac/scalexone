-- ============================================
-- INICIALIZACIÓN COMPLETA DE DATOS SCALEXONE
-- ============================================

-- 1. ASEGURAR QUE SCALEXONE EXISTE Y ESTÁ CONFIGURADO
DO $$
DECLARE
    scalexone_id UUID;
    admin_user_id UUID;
BEGIN
    -- Buscar o crear ScaleXone
    SELECT id INTO scalexone_id FROM comunidades WHERE slug = 'scalexone';
    
    IF scalexone_id IS NULL THEN
        INSERT INTO comunidades (
            nombre, slug, descripcion, is_public, 
            configuracion, estado
        ) VALUES (
            'ScaleXOne',
            'scalexone',
            'Plataforma principal de ScaleXOne - Comunidad de crecimiento empresarial',
            true,
            '{"es_principal": true, "marca_blanca": true}',
            'activa'
        ) RETURNING id INTO scalexone_id;
        
        RAISE NOTICE '✅ Comunidad ScaleXOne creada con ID: %', scalexone_id;
    ELSE
        RAISE NOTICE '✅ Comunidad ScaleXOne ya existe con ID: %', scalexone_id;
    END IF;
    
    -- Buscar usuario admin para ScaleXone
    SELECT id INTO admin_user_id 
    FROM usuarios 
    WHERE email = 'homodeus.cith@gmail.com' 
    OR rol IN ('admin', 'superadmin')
    LIMIT 1;
    
    -- Actualizar owner de ScaleXone si se encontró admin
    IF admin_user_id IS NOT NULL THEN
        UPDATE comunidades 
        SET owner_id = admin_user_id
        WHERE id = scalexone_id;
        
        RAISE NOTICE '✅ Owner de ScaleXOne actualizado: %', admin_user_id;
    END IF;
END $$;

-- 2. CREAR CANALES POR DEFECTO PARA SCALEXONE
DO $$
DECLARE
    scalexone_id UUID;
    admin_user_id UUID;
    plan_basico_id UUID;
    plan_pro_id UUID;
BEGIN
    -- Obtener IDs necesarios
    SELECT id INTO scalexone_id FROM comunidades WHERE slug = 'scalexone';
    SELECT id INTO admin_user_id FROM usuarios WHERE rol IN ('admin', 'superadmin') LIMIT 1;
    
    -- Crear canales básicos
    INSERT INTO canales_comunidad (
        community_id, nombre, descripcion, tipo, activo, orden, created_by
    ) VALUES
    (scalexone_id, 'General', 'Canal principal para conversaciones generales', 'public', true, 1, admin_user_id),
    (scalexone_id, 'Presentaciones', 'Canal para presentarse a la comunidad', 'public', true, 2, admin_user_id),
    (scalexone_id, 'Recursos', 'Compartir recursos útiles y herramientas', 'public', true, 3, admin_user_id),
    (scalexone_id, 'Networking', 'Conectar con otros miembros de la comunidad', 'public', true, 4, admin_user_id),
    (scalexone_id, 'Ideas', 'Compartir ideas y proyectos innovadores', 'public', true, 5, admin_user_id),
    (scalexone_id, 'Anuncios', 'Anuncios importantes de la plataforma', 'public', true, 6, admin_user_id)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Canales básicos creados para ScaleXOne';
END $$;

-- 3. CREAR PLANES DE SUSCRIPCIÓN PARA SCALEXONE
DO $$
DECLARE
    scalexone_id UUID;
BEGIN
    SELECT id INTO scalexone_id FROM comunidades WHERE slug = 'scalexone';
    
    INSERT INTO planes_suscripcion (
        comunidad_id, nombre, descripcion, precio, moneda, duracion_dias,
        caracteristicas, activo, orden
    ) VALUES
    (scalexone_id, 'Plan Básico', 'Acceso básico a ScaleXOne', 29.99, 'USD', 30, 
     '["Acceso a módulos básicos", "Soporte por email", "Comunidad"]', true, 1),
    (scalexone_id, 'Plan Pro', 'Acceso completo con herramientas avanzadas', 99.99, 'USD', 30,
     '["Todo del Plan Básico", "Herramientas IA", "Soporte prioritario", "Canales premium"]', true, 2),
    (scalexone_id, 'Plan Enterprise', 'Solución empresarial completa', 299.99, 'USD', 30,
     '["Todo del Plan Pro", "Marca blanca", "API acceso", "Soporte dedicado"]', true, 3)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Planes de suscripción creados para ScaleXOne';
END $$;

-- 4. ASEGURAR QUE USUARIOS TENGAN DATOS PARA RANKING
UPDATE usuarios 
SET nivel_usuario = CASE 
    WHEN nivel_usuario IS NULL OR nivel_usuario = 0 THEN 
        FLOOR(RANDOM() * 1000) + 100  -- Nivel aleatorio entre 100-1100
    ELSE nivel_usuario 
END
WHERE community_id = 'scalexone';

-- 5. CREAR ALGUNOS POSTS DE EJEMPLO (OPCIONAL)
DO $$
DECLARE
    scalexone_id UUID;
    canal_general_id UUID;
    admin_user_id UUID;
BEGIN
    SELECT id INTO scalexone_id FROM comunidades WHERE slug = 'scalexone';
    SELECT id INTO canal_general_id FROM canales_comunidad 
    WHERE community_id = scalexone_id AND nombre = 'General' LIMIT 1;
    SELECT id INTO admin_user_id FROM usuarios WHERE rol IN ('admin', 'superadmin') LIMIT 1;
    
    -- Solo crear si no existen posts
    IF NOT EXISTS (SELECT 1 FROM comunidad_posts WHERE community_id = scalexone_id) THEN
        INSERT INTO comunidad_posts (
            community_id, usuario_id, contenido, canal_id
        ) VALUES
        (scalexone_id, admin_user_id, '¡Bienvenidos a ScaleXOne! 🚀 Esta es nuestra comunidad principal donde podrán crecer y escalar sus negocios.', canal_general_id),
        (scalexone_id, admin_user_id, 'Recuerden presentarse en el canal #Presentaciones para conocer a toda la comunidad 👋', canal_general_id);
        
        RAISE NOTICE '✅ Posts de ejemplo creados';
    END IF;
END $$;

-- 6. VERIFICACIÓN FINAL
SELECT 
    '🎯 SCALEXONE INICIALIZADO CORRECTAMENTE' as status,
    (SELECT COUNT(*) FROM usuarios WHERE community_id = 'scalexone') as usuarios,
    (SELECT COUNT(*) FROM canales_comunidad cc JOIN comunidades c ON cc.community_id = c.id WHERE c.slug = 'scalexone') as canales,
    (SELECT COUNT(*) FROM planes_suscripcion ps JOIN comunidades c ON ps.comunidad_id = c.id WHERE c.slug = 'scalexone') as planes; 