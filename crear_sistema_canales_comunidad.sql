-- SCRIPT PARA CREAR SISTEMA DE CANALES DE COMUNIDAD
-- Versión: 1.0 - Integrado con Sistema de Suscripciones ScaleXone
-- Fecha: 2024

-- ===============================================
-- 1. CREAR TABLA CANALES_COMUNIDAD
-- ===============================================

CREATE TABLE IF NOT EXISTS canales_comunidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id VARCHAR(100) NOT NULL, -- Referencia al community_id del usuario (ej: 'scalexone')
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'public' CHECK (tipo IN ('public', 'private')),
    permisos_publicar VARCHAR(20) DEFAULT 'todos' CHECK (permisos_publicar IN ('todos', 'admin_mod', 'solo_admin')),
    permisos_comentar VARCHAR(20) DEFAULT 'todos' CHECK (permisos_comentar IN ('todos', 'admin_mod', 'solo_admin')),
    membresia_requerida UUID REFERENCES planes_suscripcion(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ===============================================
-- 2. CREAR TABLA MENSAJES_CANAL
-- ===============================================

CREATE TABLE IF NOT EXISTS mensajes_canal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canal_id UUID NOT NULL REFERENCES canales_comunidad(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'archivo', 'video', 'audio')),
    archivos JSONB DEFAULT '[]', -- Array de URLs de archivos adjuntos
    respuesta_a UUID REFERENCES mensajes_canal(id) ON DELETE SET NULL, -- Para hilos de respuestas
    editado BOOLEAN DEFAULT false,
    editado_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 3. CREAR TABLA REACCIONES_MENSAJE
-- ===============================================

CREATE TABLE IF NOT EXISTS reacciones_mensaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensaje_id UUID NOT NULL REFERENCES mensajes_canal(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL, -- Emoji de la reacción
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mensaje_id, usuario_id, emoji) -- Un usuario solo puede dar una reacción del mismo tipo por mensaje
);

-- ===============================================
-- 4. CREAR TABLA MIEMBROS_CANAL (para canales privados)
-- ===============================================

CREATE TABLE IF NOT EXISTS miembros_canal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canal_id UUID NOT NULL REFERENCES canales_comunidad(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(20) DEFAULT 'miembro' CHECK (rol IN ('miembro', 'moderador', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE(canal_id, usuario_id) -- Un usuario solo puede estar una vez por canal
);

-- ===============================================
-- 5. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================

-- Índices para canales_comunidad
CREATE INDEX IF NOT EXISTS idx_canales_community_id ON canales_comunidad(community_id);
CREATE INDEX IF NOT EXISTS idx_canales_activo ON canales_comunidad(activo);
CREATE INDEX IF NOT EXISTS idx_canales_orden ON canales_comunidad(orden);
CREATE INDEX IF NOT EXISTS idx_canales_tipo ON canales_comunidad(tipo);
CREATE INDEX IF NOT EXISTS idx_canales_membresia ON canales_comunidad(membresia_requerida);

-- Índices para mensajes_canal
CREATE INDEX IF NOT EXISTS idx_mensajes_canal_id ON mensajes_canal(canal_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario_id ON mensajes_canal(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created_at ON mensajes_canal(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_respuesta_a ON mensajes_canal(respuesta_a);

-- Índices para reacciones_mensaje
CREATE INDEX IF NOT EXISTS idx_reacciones_mensaje_id ON reacciones_mensaje(mensaje_id);
CREATE INDEX IF NOT EXISTS idx_reacciones_usuario_id ON reacciones_mensaje(usuario_id);

-- Índices para miembros_canal
CREATE INDEX IF NOT EXISTS idx_miembros_canal_id ON miembros_canal(canal_id);
CREATE INDEX IF NOT EXISTS idx_miembros_usuario_id ON miembros_canal(usuario_id);

-- ===============================================
-- 6. CREAR FUNCIONES ÚTILES
-- ===============================================

-- Función para obtener canales por comunidad con información de plan
CREATE OR REPLACE FUNCTION get_canales_por_comunidad(p_community_id VARCHAR)
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    descripcion TEXT,
    tipo VARCHAR,
    permisos_publicar VARCHAR,
    permisos_comentar VARCHAR,
    activo BOOLEAN,
    orden INTEGER,
    plan_requerido VARCHAR,
    plan_precio DECIMAL,
    total_mensajes BIGINT,
    ultimo_mensaje TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nombre,
        c.descripcion,
        c.tipo,
        c.permisos_publicar,
        c.permisos_comentar,
        c.activo,
        c.orden,
        COALESCE(p.nombre, 'Acceso libre') as plan_requerido,
        p.precio as plan_precio,
        COUNT(m.id) as total_mensajes,
        MAX(m.created_at) as ultimo_mensaje
    FROM canales_comunidad c
    LEFT JOIN planes_suscripcion p ON c.membresia_requerida = p.id
    LEFT JOIN mensajes_canal m ON c.id = m.canal_id
    WHERE c.community_id = p_community_id
    AND c.activo = true
    GROUP BY c.id, c.nombre, c.descripcion, c.tipo, c.permisos_publicar, c.permisos_comentar, c.activo, c.orden, p.nombre, p.precio
    ORDER BY c.orden ASC, c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener mensajes de un canal con verificación de permisos
CREATE OR REPLACE FUNCTION get_mensajes_canal(
    p_canal_id UUID,
    p_usuario_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    contenido TEXT,
    tipo VARCHAR,
    archivos JSONB,
    respuesta_a UUID,
    editado BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    usuario_id UUID,
    usuario_nombre VARCHAR,
    usuario_avatar VARCHAR,
    total_reacciones JSONB
) AS $$
DECLARE
    tiene_acceso BOOLEAN := false;
    canal_community_id VARCHAR;
    plan_requerido UUID;
    usuario_community_id VARCHAR;
BEGIN
    -- Verificar si el usuario tiene acceso al canal
    SELECT cc.community_id, cc.membresia_requerida INTO canal_community_id, plan_requerido
    FROM canales_comunidad cc WHERE cc.id = p_canal_id;
    
    SELECT u.community_id INTO usuario_community_id 
    FROM usuarios u WHERE u.id = p_usuario_id;
    
    -- Verificar si pertenece a la misma comunidad
    IF canal_community_id = usuario_community_id THEN
        tiene_acceso := true;
        
        -- Si hay plan requerido, verificar suscripción activa
        IF plan_requerido IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM suscripciones s 
                WHERE s.usuario_id = p_usuario_id 
                AND s.plan_id = plan_requerido 
                AND s.estado = 'activa'
                AND s.fecha_fin > CURRENT_TIMESTAMP
            ) THEN
                tiene_acceso := false;
            END IF;
        END IF;
    END IF;
    
    -- Si no tiene acceso, retornar vacío
    IF NOT tiene_acceso THEN
        RETURN;
    END IF;
    
    -- Retornar mensajes del canal
    RETURN QUERY
    SELECT 
        m.id,
        m.contenido,
        m.tipo,
        m.archivos,
        m.respuesta_a,
        m.editado,
        m.created_at,
        m.usuario_id,
        u.name as usuario_nombre,
        u.avatar_url as usuario_avatar,
        COALESCE(
            json_object_agg(r.emoji, r.count) FILTER (WHERE r.emoji IS NOT NULL),
            '{}'::json
        )::jsonb as total_reacciones
    FROM mensajes_canal m
    JOIN usuarios u ON m.usuario_id = u.id
    LEFT JOIN (
        SELECT 
            mensaje_id,
            emoji,
            COUNT(*) as count
        FROM reacciones_mensaje
        GROUP BY mensaje_id, emoji
    ) r ON m.id = r.mensaje_id
    WHERE m.canal_id = p_canal_id
    GROUP BY m.id, m.contenido, m.tipo, m.archivos, m.respuesta_a, m.editado, m.created_at, m.usuario_id, u.name, u.avatar_url
    ORDER BY m.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario puede acceder a un canal
CREATE OR REPLACE FUNCTION usuario_puede_acceder_canal(
    p_usuario_id UUID,
    p_canal_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    canal_community_id VARCHAR;
    plan_requerido UUID;
    usuario_community_id VARCHAR;
    usuario_rol VARCHAR;
BEGIN
    -- Obtener datos del canal
    SELECT cc.community_id, cc.membresia_requerida 
    INTO canal_community_id, plan_requerido
    FROM canales_comunidad cc 
    WHERE cc.id = p_canal_id AND cc.activo = true;
    
    -- Si no existe el canal, no tiene acceso
    IF canal_community_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Obtener datos del usuario
    SELECT u.community_id, u.rol 
    INTO usuario_community_id, usuario_rol
    FROM usuarios u 
    WHERE u.id = p_usuario_id;
    
    -- Verificar si pertenece a la misma comunidad
    IF canal_community_id != usuario_community_id THEN
        RETURN false;
    END IF;
    
    -- Los admins siempre tienen acceso
    IF usuario_rol IN ('admin', 'superadmin') THEN
        RETURN true;
    END IF;
    
    -- Si no hay plan requerido, acceso libre
    IF plan_requerido IS NULL THEN
        RETURN true;
    END IF;
    
    -- Verificar suscripción activa
    RETURN EXISTS (
        SELECT 1 FROM suscripciones s 
        WHERE s.usuario_id = p_usuario_id 
        AND s.plan_id = plan_requerido 
        AND s.estado = 'activa'
        AND s.fecha_fin > CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 7. HABILITAR RLS (Row Level Security)
-- ===============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE canales_comunidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_canal ENABLE ROW LEVEL SECURITY;
ALTER TABLE reacciones_mensaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_canal ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 8. CREAR POLÍTICAS RLS
-- ===============================================

-- Políticas para canales_comunidad
CREATE POLICY "Los usuarios pueden ver canales de su comunidad" ON canales_comunidad
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND community_id = canales_comunidad.community_id
        )
    );

CREATE POLICY "Los admins pueden crear canales" ON canales_comunidad
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND community_id = canales_comunidad.community_id
            AND rol IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Los admins pueden actualizar canales de su comunidad" ON canales_comunidad
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND community_id = canales_comunidad.community_id
            AND rol IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Los admins pueden eliminar canales de su comunidad" ON canales_comunidad
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND community_id = canales_comunidad.community_id
            AND rol IN ('admin', 'superadmin')
        )
    );

-- Políticas para mensajes_canal
CREATE POLICY "Los usuarios pueden ver mensajes de canales accesibles" ON mensajes_canal
    FOR SELECT USING (
        usuario_puede_acceder_canal(auth.uid(), mensajes_canal.canal_id)
    );

CREATE POLICY "Los usuarios pueden crear mensajes en canales permitidos" ON mensajes_canal
    FOR INSERT WITH CHECK (
        usuario_puede_acceder_canal(auth.uid(), mensajes_canal.canal_id)
        AND EXISTS (
            SELECT 1 FROM canales_comunidad c
            JOIN usuarios u ON u.community_id = c.community_id
            WHERE c.id = mensajes_canal.canal_id
            AND u.id = auth.uid()
            AND c.activo = true
            AND (
                c.permisos_publicar = 'todos' OR
                (c.permisos_publicar = 'admin_mod' AND u.rol IN ('admin', 'superadmin', 'moderador')) OR
                (c.permisos_publicar = 'solo_admin' AND u.rol IN ('admin', 'superadmin'))
            )
        )
    );

CREATE POLICY "Los usuarios pueden actualizar sus propios mensajes" ON mensajes_canal
    FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Los usuarios pueden eliminar sus propios mensajes o admins todos" ON mensajes_canal
    FOR DELETE USING (
        usuario_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND rol IN ('admin', 'superadmin')
        )
    );

-- Políticas para reacciones_mensaje
CREATE POLICY "Los usuarios pueden ver reacciones de mensajes accesibles" ON reacciones_mensaje
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mensajes_canal m
            WHERE m.id = reacciones_mensaje.mensaje_id
            AND usuario_puede_acceder_canal(auth.uid(), m.canal_id)
        )
    );

CREATE POLICY "Los usuarios pueden crear/eliminar sus propias reacciones" ON reacciones_mensaje
    FOR ALL USING (usuario_id = auth.uid());

-- ===============================================
-- 9. CREAR TRIGGERS PARA UPDATED_AT
-- ===============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_canales_comunidad_updated_at 
    BEFORE UPDATE ON canales_comunidad 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mensajes_canal_updated_at 
    BEFORE UPDATE ON mensajes_canal 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 10. INSERTAR CANALES POR DEFECTO PARA SCALEXONE
-- ===============================================

-- Buscar si existe la comunidad ScaleXOne y crear canales por defecto
DO $$
DECLARE
    scalexone_community_exists BOOLEAN;
    admin_user_id UUID;
    plan_basico_id UUID;
    plan_pro_id UUID;
BEGIN
    -- Verificar si existe ScaleXOne
    SELECT EXISTS(
        SELECT 1 FROM usuarios WHERE community_id = 'scalexone' LIMIT 1
    ) INTO scalexone_community_exists;

    -- Si existe ScaleXOne, crear canales por defecto
    IF scalexone_community_exists THEN
        -- Buscar un admin de ScaleXOne
        SELECT id INTO admin_user_id
        FROM usuarios 
        WHERE community_id = 'scalexone' 
        AND rol IN ('admin', 'superadmin') 
        LIMIT 1;
        
        -- Buscar IDs de planes para restricciones
        SELECT p.id INTO plan_basico_id
        FROM planes_suscripcion p
        JOIN comunidades c ON p.comunidad_id = c.id
        WHERE c.slug = 'scalexone' AND p.nombre ILIKE '%básico%'
        LIMIT 1;
        
        SELECT p.id INTO plan_pro_id
        FROM planes_suscripcion p
        JOIN comunidades c ON p.comunidad_id = c.id
        WHERE c.slug = 'scalexone' AND p.nombre ILIKE '%pro%'
        LIMIT 1;

        -- Canal General (acceso libre)
        INSERT INTO canales_comunidad (
            community_id, nombre, descripcion, tipo, orden, created_by
        ) VALUES (
            'scalexone',
            'general',
            'Canal principal para conversaciones generales de la comunidad ScaleXone',
            'public',
            1,
            admin_user_id
        ) ON CONFLICT DO NOTHING;

        -- Canal Anuncios (solo admins pueden publicar)
        INSERT INTO canales_comunidad (
            community_id, nombre, descripcion, tipo, permisos_publicar, permisos_comentar, orden, created_by
        ) VALUES (
            'scalexone',
            'anuncios',
            'Canal para anuncios importantes y actualizaciones oficiales de ScaleXone',
            'public',
            'solo_admin',
            'todos',
            2,
            admin_user_id
        ) ON CONFLICT DO NOTHING;

        -- Canal Soporte (acceso libre)
        INSERT INTO canales_comunidad (
            community_id, nombre, descripcion, tipo, orden, created_by
        ) VALUES (
            'scalexone',
            'soporte',
            'Canal para obtener ayuda y soporte técnico',
            'public',
            3,
            admin_user_id
        ) ON CONFLICT DO NOTHING;

        -- Canal Premium (requiere plan Pro o superior)
        IF plan_pro_id IS NOT NULL THEN
            INSERT INTO canales_comunidad (
                community_id, nombre, descripcion, tipo, membresia_requerida, orden, created_by
            ) VALUES (
                'scalexone',
                'premium',
                'Canal exclusivo para miembros con plan Pro o superior',
                'public',
                plan_pro_id,
                4,
                admin_user_id
            ) ON CONFLICT DO NOTHING;
        END IF;

        -- Canal Recursos (acceso libre)
        INSERT INTO canales_comunidad (
            community_id, nombre, descripcion, tipo, orden, created_by
        ) VALUES (
            'scalexone',
            'recursos',
            'Compartir recursos, herramientas y materiales útiles para emprendedores',
            'public',
            5,
            admin_user_id
        ) ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Canales por defecto creados para ScaleXone';
    ELSE
        RAISE NOTICE 'No se encontró la comunidad ScaleXone, no se crearon canales por defecto';
    END IF;
END $$;

-- ===============================================
-- 11. VERIFICACIÓN FINAL
-- ===============================================

-- Mostrar resumen de lo creado
SELECT 'RESUMEN DEL SISTEMA DE CANALES SCALEXONE' as resultado;

SELECT 
    'Tablas creadas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.tables 
WHERE table_name IN ('canales_comunidad', 'mensajes_canal', 'reacciones_mensaje', 'miembros_canal')
AND table_schema = 'public';

SELECT 
    'Funciones creadas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.routines 
WHERE routine_name IN ('get_canales_por_comunidad', 'get_mensajes_canal', 'usuario_puede_acceder_canal')
AND routine_schema = 'public';

SELECT 
    'Canales ScaleXone creados' as tipo,
    COUNT(*) as cantidad
FROM canales_comunidad 
WHERE community_id = 'scalexone';

-- Mostrar canales creados con sus restricciones
SELECT 
    'CANALES SCALEXONE - CONFIGURACIÓN' as info;
    
SELECT 
    cc.nombre as canal,
    cc.tipo,
    cc.permisos_publicar,
    COALESCE(ps.nombre, 'Acceso libre') as plan_requerido,
    ps.precio
FROM canales_comunidad cc
LEFT JOIN planes_suscripcion ps ON cc.membresia_requerida = ps.id
WHERE cc.community_id = 'scalexone'
ORDER BY cc.orden;

-- FIN DEL SCRIPT 