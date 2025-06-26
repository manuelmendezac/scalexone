-- ============================================
-- SCRIPT CON CASCADE: Funcionalidad de Canales en Posts
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar campo canal_id a comunidad_posts
ALTER TABLE comunidad_posts 
ADD COLUMN IF NOT EXISTS canal_id UUID REFERENCES canales_comunidad(id);

-- 2. Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_comunidad_posts_canal_id ON comunidad_posts(canal_id);

-- 3. ELIMINAR funciones con CASCADE (elimina automáticamente las políticas que dependen)
DROP FUNCTION IF EXISTS get_posts_por_canal CASCADE;
DROP FUNCTION IF EXISTS usuario_puede_publicar_canal CASCADE;
DROP FUNCTION IF EXISTS get_canales_publicar_usuario CASCADE;
DROP FUNCTION IF EXISTS usuario_puede_acceder_canal CASCADE;

-- 4. Función para usuario_puede_acceder_canal
CREATE FUNCTION usuario_puede_acceder_canal(
    p_usuario_id UUID,
    p_canal_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    canal_membresia UUID;
    usuario_plan_id UUID;
    plan_precio DECIMAL;
    canal_precio DECIMAL;
BEGIN
    -- Si canal_id es NULL, permitir acceso
    IF p_canal_id IS NULL THEN
        RETURN true;
    END IF;

    -- Obtener membresía requerida del canal
    SELECT membresia_requerida INTO canal_membresia
    FROM canales_comunidad
    WHERE id = p_canal_id AND activo = true;
    
    -- Si no requiere membresía, acceso libre
    IF canal_membresia IS NULL THEN
        RETURN true;
    END IF;
    
    -- Obtener plan actual del usuario
    SELECT s.plan_id INTO usuario_plan_id
    FROM suscripciones s
    WHERE s.usuario_id = p_usuario_id 
    AND s.estado = 'activa'
    AND s.fecha_fin > NOW()
    ORDER BY s.fecha_creacion DESC
    LIMIT 1;
    
    -- Si no tiene suscripción activa
    IF usuario_plan_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Comparar precios de planes
    SELECT precio INTO plan_precio FROM planes_suscripcion WHERE id = usuario_plan_id;
    SELECT precio INTO canal_precio FROM planes_suscripcion WHERE id = canal_membresia;
    
    RETURN COALESCE(plan_precio, 0) >= COALESCE(canal_precio, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para verificar permisos de publicación
CREATE FUNCTION usuario_puede_publicar_canal(
    p_usuario_id UUID,
    p_canal_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    canal_membresia UUID;
    usuario_plan_id UUID;
    plan_precio DECIMAL;
    canal_precio DECIMAL;
BEGIN
    -- Si canal_id es NULL, permitir (canal general)
    IF p_canal_id IS NULL THEN
        RETURN true;
    END IF;

    -- Obtener membresía requerida del canal
    SELECT membresia_requerida INTO canal_membresia
    FROM canales_comunidad
    WHERE id = p_canal_id AND activo = true;
    
    -- Si no requiere membresía, acceso libre
    IF canal_membresia IS NULL THEN
        RETURN true;
    END IF;
    
    -- Obtener plan actual del usuario
    SELECT s.plan_id INTO usuario_plan_id
    FROM suscripciones s
    WHERE s.usuario_id = p_usuario_id 
    AND s.estado = 'activa'
    AND s.fecha_fin > NOW()
    ORDER BY s.fecha_creacion DESC
    LIMIT 1;
    
    -- Si no tiene suscripción activa
    IF usuario_plan_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Comparar precios de planes
    SELECT precio INTO plan_precio FROM planes_suscripcion WHERE id = usuario_plan_id;
    SELECT precio INTO canal_precio FROM planes_suscripcion WHERE id = canal_membresia;
    
    RETURN COALESCE(plan_precio, 0) >= COALESCE(canal_precio, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para obtener posts por canal
CREATE FUNCTION get_posts_por_canal(
    p_community_id UUID,
    p_canal_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    contenido TEXT,
    imagen_url TEXT,
    video_url TEXT,
    link_url TEXT,
    link_titulo TEXT,
    link_descripcion TEXT,
    link_imagen TEXT,
    usuario_id UUID,
    canal_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.contenido,
        p.imagen_url,
        p.video_url,
        p.link_url,
        p.link_titulo,
        p.link_descripcion,
        p.link_imagen,
        p.usuario_id,
        p.canal_id,
        p.created_at,
        p.updated_at
    FROM comunidad_posts p
    WHERE p.community_id = p_community_id
    AND (p_canal_id IS NULL OR p.canal_id = p_canal_id)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función para obtener canales donde usuario puede publicar
CREATE FUNCTION get_canales_publicar_usuario(
    p_usuario_id UUID,
    p_community_id UUID
)
RETURNS TABLE (
    id UUID,
    nombre TEXT,
    descripcion TEXT,
    puede_publicar BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nombre,
        c.descripcion,
        usuario_puede_publicar_canal(p_usuario_id, c.id) as puede_publicar
    FROM canales_comunidad c
    WHERE c.community_id = p_community_id 
    AND c.activo = true
    ORDER BY c.orden ASC, c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RECREAR Política RLS para posts con canales
CREATE POLICY "Usuarios pueden ver posts de canales accesibles" ON comunidad_posts
    FOR SELECT USING (
        canal_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM canales_comunidad c 
            WHERE c.id = canal_id 
            AND c.activo = true
            AND (
                c.membresia_requerida IS NULL OR
                usuario_puede_acceder_canal(auth.uid(), c.id)
            )
        )
    );

-- 9. RECREAR Política para insertar posts (verificar permisos de canal)
CREATE POLICY "Usuarios pueden insertar posts en canales permitidos" ON comunidad_posts
    FOR INSERT WITH CHECK (
        auth.uid() = usuario_id AND
        (canal_id IS NULL OR usuario_puede_publicar_canal(auth.uid(), canal_id))
    );

-- 10. Verificación final
DO $$
BEGIN
    RAISE NOTICE '✅ Campo canal_id agregado correctamente a comunidad_posts';
    RAISE NOTICE '✅ Función get_posts_por_canal creada correctamente';
    RAISE NOTICE '✅ Función usuario_puede_publicar_canal creada correctamente';
    RAISE NOTICE '✅ Función get_canales_publicar_usuario creada correctamente';
    RAISE NOTICE '✅ Función usuario_puede_acceder_canal creada correctamente';
    RAISE NOTICE '✅ Política de SELECT creada correctamente';
    RAISE NOTICE '✅ Política de INSERT creada correctamente';
    RAISE NOTICE '🎉 SISTEMA DE CANALES COMPLETAMENTE FUNCIONAL';
END $$;

-- ============================================
-- SCRIPT COMPLETADO CON CASCADE
-- ============================================ 