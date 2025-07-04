-- Script para agregar community_id a todas las tablas de Launchpad
-- y migrar los datos existentes a la comunidad Scalexone

-- 1. Agregar community_id a launchpad_events
ALTER TABLE launchpad_events 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id);

-- 2. Agregar community_id a launchpad_links  
ALTER TABLE launchpad_links 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id);

-- 3. Agregar community_id a launchpad_settings
ALTER TABLE launchpad_settings 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id);

-- 4. Agregar community_id a launchpad_videos
ALTER TABLE launchpad_videos 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id);

-- 5. Agregar community_id a launchpad_video_ratings
ALTER TABLE launchpad_video_ratings 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id);

-- 6. Agregar community_id a launchpad_video_comments
ALTER TABLE launchpad_video_comments 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id);

-- 7. Migrar datos existentes a la comunidad Scalexone
UPDATE launchpad_events 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1' 
WHERE community_id IS NULL;

UPDATE launchpad_links 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1' 
WHERE community_id IS NULL;

UPDATE launchpad_settings 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1' 
WHERE community_id IS NULL;

UPDATE launchpad_videos 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1' 
WHERE community_id IS NULL;

UPDATE launchpad_video_ratings 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1' 
WHERE community_id IS NULL;

UPDATE launchpad_video_comments 
SET community_id = '8fb70d6e-3237-465e-8669-979461cf2bc1' 
WHERE community_id IS NULL;

-- 8. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_launchpad_events_community_id ON launchpad_events(community_id);
CREATE INDEX IF NOT EXISTS idx_launchpad_links_community_id ON launchpad_links(community_id);
CREATE INDEX IF NOT EXISTS idx_launchpad_settings_community_id ON launchpad_settings(community_id);
CREATE INDEX IF NOT EXISTS idx_launchpad_videos_community_id ON launchpad_videos(community_id);
CREATE INDEX IF NOT EXISTS idx_launchpad_video_ratings_community_id ON launchpad_video_ratings(community_id);
CREATE INDEX IF NOT EXISTS idx_launchpad_video_comments_community_id ON launchpad_video_comments(community_id);

-- 9. Hacer community_id NOT NULL después de migrar los datos
ALTER TABLE launchpad_events ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE launchpad_links ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE launchpad_settings ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE launchpad_videos ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE launchpad_video_ratings ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE launchpad_video_comments ALTER COLUMN community_id SET NOT NULL;

-- 10. Crear políticas RLS para cada tabla
-- Políticas para launchpad_events
CREATE POLICY "Usuarios pueden ver eventos de su comunidad" ON launchpad_events
    FOR SELECT USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

CREATE POLICY "Admins pueden gestionar eventos de su comunidad" ON launchpad_events
    FOR ALL USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

-- Políticas para launchpad_links
CREATE POLICY "Usuarios pueden ver enlaces de su comunidad" ON launchpad_links
    FOR SELECT USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

CREATE POLICY "Admins pueden gestionar enlaces de su comunidad" ON launchpad_links
    FOR ALL USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

-- Políticas para launchpad_settings
CREATE POLICY "Usuarios pueden ver configuración de su comunidad" ON launchpad_settings
    FOR SELECT USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

CREATE POLICY "Admins pueden gestionar configuración de su comunidad" ON launchpad_settings
    FOR ALL USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

-- Políticas para launchpad_videos
CREATE POLICY "Usuarios pueden ver videos de su comunidad" ON launchpad_videos
    FOR SELECT USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

CREATE POLICY "Admins pueden gestionar videos de su comunidad" ON launchpad_videos
    FOR ALL USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

-- Políticas para launchpad_video_ratings
CREATE POLICY "Usuarios pueden ver calificaciones de su comunidad" ON launchpad_video_ratings
    FOR SELECT USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

CREATE POLICY "Usuarios pueden crear calificaciones en su comunidad" ON launchpad_video_ratings
    FOR INSERT WITH CHECK (community_id = auth.jwt() ->> 'community_id'::text::uuid);

-- Políticas para launchpad_video_comments
CREATE POLICY "Usuarios pueden ver comentarios de su comunidad" ON launchpad_video_comments
    FOR SELECT USING (community_id = auth.jwt() ->> 'community_id'::text::uuid);

CREATE POLICY "Usuarios pueden crear comentarios en su comunidad" ON launchpad_video_comments
    FOR INSERT WITH CHECK (community_id = auth.jwt() ->> 'community_id'::text::uuid);

-- Habilitar RLS en todas las tablas
ALTER TABLE launchpad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE launchpad_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE launchpad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE launchpad_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE launchpad_video_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE launchpad_video_comments ENABLE ROW LEVEL SECURITY; 