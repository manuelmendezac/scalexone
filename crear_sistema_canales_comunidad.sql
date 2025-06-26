-- ===============================================
-- SCRIPT: Sistema de Canales para Comunidades
-- Versión: 1.1 - CORREGIDO - UUID community_id 
-- Descripción: Sistema completo de canales con mensajes, reacciones y membresías
-- Integrado con Sistema de Suscripciones ScaleXone
-- ===============================================

-- ===============================================
-- 1. CREAR TABLAS PRINCIPALES
-- ===============================================

-- Tabla: canales_comunidad (Ya existe, solo agregar columnas faltantes)
DO $$
BEGIN
    -- Agregar columna activo si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canales_comunidad' AND column_name = 'activo') THEN
        ALTER TABLE canales_comunidad ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
    
    -- Agregar columna orden si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canales_comunidad' AND column_name = 'orden') THEN
        ALTER TABLE canales_comunidad ADD COLUMN orden INTEGER DEFAULT 0;
    END IF;
    
    -- Verificar si community_id es VARCHAR y corregir a UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'canales_comunidad' 
        AND column_name = 'community_id' 
        AND data_type = 'character varying'
    ) THEN
        -- Primero verificar si hay datos
        IF EXISTS (SELECT 1 FROM canales_comunidad LIMIT 1) THEN
            RAISE NOTICE 'Advertencia: La tabla canales_comunidad tiene datos. Manteniendo VARCHAR por compatibilidad.';
        ELSE
            -- Si no hay datos, cambiar a UUID
            ALTER TABLE canales_comunidad ALTER COLUMN community_id TYPE UUID USING community_id::uuid;
            RAISE NOTICE 'Columna community_id convertida de VARCHAR a UUID';
        END IF;
    END IF;
END $$;

-- Crear tabla mensajes_canal
CREATE TABLE IF NOT EXISTS mensajes_canal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canal_id UUID NOT NULL REFERENCES canales_comunidad(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'archivo', 'enlace')),
    archivos JSONB DEFAULT '[]'::jsonb,
    respuesta_a UUID REFERENCES mensajes_canal(id) ON DELETE SET NULL,
    editado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla reacciones_mensaje  
CREATE TABLE IF NOT EXISTS reacciones_mensaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensaje_id UUID NOT NULL REFERENCES mensajes_canal(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mensaje_id, usuario_id, emoji)
);

-- Crear tabla miembros_canal (para canales privados)
CREATE TABLE IF NOT EXISTS miembros_canal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canal_id UUID NOT NULL REFERENCES canales_comunidad(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(20) DEFAULT 'miembro' CHECK (rol IN ('miembro', 'moderador', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(canal_id, usuario_id)
);

-- ===============================================
-- 2. CREAR ÍNDICES PARA OPTIMIZACIÓN
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
-- 3. CREAR FUNCIONES PARA GESTIÓN DE CANALES
-- ===============================================

-- Función para obtener canales por comunidad (CORREGIDA PARA UUID)
CREATE OR REPLACE FUNCTION get_canales_por_comunidad(p_community_id UUID)
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    descripcion TEXT,
    tipo VARCHAR,
    permisos_publicar VARCHAR,
    permisos_comentar VARCHAR,
    membresia_requerida UUID,
    plan_nombre VARCHAR,
    plan_precio DECIMAL,
    activo BOOLEAN,
    orden INTEGER,
    total_mensajes BIGINT,
    ultimo_mensaje_fecha TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id,
        cc.nombre,
        cc.descripcion,
        cc.tipo,
        cc.permisos_publicar,
        cc.permisos_comentar,
        cc.membresia_requerida,
        ps.nombre as plan_nombre,
        ps.precio as plan_precio,
        cc.activo,
        cc.orden,
        COALESCE(stats.total_mensajes, 0) as total_mensajes,
        stats.ultimo_mensaje_fecha,
        cc.created_at,
        cc.updated_at
    FROM canales_comunidad cc
    LEFT JOIN planes_suscripcion ps ON cc.membresia_requerida = ps.id
    LEFT JOIN (
        SELECT 
            canal_id,
            COUNT(*) as total_mensajes,
            MAX(created_at) as ultimo_mensaje_fecha
        FROM mensajes_canal
        GROUP BY canal_id
    ) stats ON cc.id = stats.canal_id
    WHERE cc.community_id = p_community_id
    AND cc.activo = true
    ORDER BY cc.orden ASC, cc.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener mensajes de un canal con paginación (CORREGIDA PARA UUID)
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
    created_at TIMESTAMPTZ,
    usuario_id UUID,
    usuario_nombre VARCHAR,
    usuario_avatar TEXT,
    total_reacciones JSONB
) AS $$
DECLARE
    tiene_acceso BOOLEAN := false;
    canal_community_id UUID;
    plan_requerido UUID;
    usuario_community_id UUID;
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

-- Función para verificar si un usuario puede acceder a un canal (CORREGIDA PARA UUID)
CREATE OR REPLACE FUNCTION usuario_puede_acceder_canal(
    p_usuario_id UUID,
    p_canal_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    canal_community_id UUID;
    plan_requerido UUID;
    usuario_community_id UUID;
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
-- 10. INSERTAR CANALES POR DEFECTO PARA SCALEXONE (CORREGIDO)
-- ===============================================

-- Buscar si existe la comunidad ScaleXOne y crear canales por defecto
DO $$
DECLARE
    scalexone_community_id UUID;
    admin_user_id UUID;
    plan_basico_id UUID;
    plan_pro_id UUID;
BEGIN
    -- Buscar el UUID real de ScaleXone
    SELECT c.id INTO scalexone_community_id
    FROM comunidades c 
    WHERE c.slug = 'scalexone' 
    LIMIT 1;

    -- Si existe ScaleXOne, crear canales por defecto
    IF scalexone_community_id IS NOT NULL THEN
        -- Buscar un admin de ScaleXOne
        SELECT u.id INTO admin_user_id
        FROM usuarios u
        WHERE u.community_id = scalexone_community_id 
        AND u.rol IN ('admin', 'superadmin') 
        LIMIT 1;
        
        -- Buscar IDs de planes para restricciones
        SELECT p.id INTO plan_basico_id
        FROM planes_suscripcion p
        WHERE p.comunidad_id = scalexone_community_id 
        AND p.nombre ILIKE '%básico%'
        LIMIT 1;
        
        SELECT p.id INTO plan_pro_id
        FROM planes_suscripcion p
        WHERE p.comunidad_id = scalexone_community_id 
        AND p.nombre ILIKE '%pro%'
        LIMIT 1;

        -- Canal General (acceso libre)
        INSERT INTO canales_comunidad (
            community_id, nombre, descripcion, tipo, orden, created_by
        ) VALUES (
            scalexone_community_id,
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
            scalexone_community_id,
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
            scalexone_community_id,
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
                scalexone_community_id,
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
            scalexone_community_id,
            'recursos',
            'Compartir recursos, herramientas y materiales útiles para emprendedores',
            'public',
            5,
            admin_user_id
        ) ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Canales por defecto creados para ScaleXone (ID: %)', scalexone_community_id;
    ELSE
        RAISE NOTICE 'No se encontró la comunidad ScaleXone, no se crearon canales por defecto';
    END IF;
END $$;

-- ===============================================
-- 11. VERIFICACIÓN FINAL
-- ===============================================

-- Mostrar resumen de lo creado
SELECT 'SISTEMA DE CANALES COMPLETADO' as resultado;

SELECT 
    'Tablas verificadas/creadas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.tables 
WHERE table_name IN ('canales_comunidad', 'mensajes_canal', 'reacciones_mensaje', 'miembros_canal')
AND table_schema = 'public';

SELECT 
    'Funciones creadas/actualizadas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.routines 
WHERE routine_name IN ('get_canales_por_comunidad', 'get_mensajes_canal', 'usuario_puede_acceder_canal')
AND routine_schema = 'public';

-- Mostrar información de ScaleXone
SELECT 
    'Comunidad ScaleXone' as info,
    c.id as community_id,
    c.nombre,
    c.slug
FROM comunidades c 
WHERE c.slug = 'scalexone';

SELECT 
    'Canales ScaleXone' as tipo,
    COUNT(*) as cantidad
FROM canales_comunidad cc
JOIN comunidades c ON cc.community_id = c.id
WHERE c.slug = 'scalexone';

-- Mostrar canales creados con sus restricciones
SELECT 
    'CONFIGURACIÓN CANALES SCALEXONE' as info;
    
SELECT 
    cc.nombre as canal,
    cc.tipo,
    cc.permisos_publicar,
    COALESCE(ps.nombre, 'Acceso libre') as plan_requerido,
    ps.precio,
    cc.activo,
    cc.orden
FROM canales_comunidad cc
JOIN comunidades c ON cc.community_id = c.id
LEFT JOIN planes_suscripcion ps ON cc.membresia_requerida = ps.id
WHERE c.slug = 'scalexone'
ORDER BY cc.orden;

-- FIN DEL SCRIPT 