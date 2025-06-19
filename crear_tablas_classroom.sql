-- Tabla principal de módulos de classroom
CREATE TABLE IF NOT EXISTS classroom_modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 0,
    color TEXT DEFAULT '#4F46E5',
    icono TEXT DEFAULT '📚',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de videos de classroom
CREATE TABLE IF NOT EXISTS videos_classroom_modulo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID REFERENCES classroom_modulos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    url TEXT NOT NULL,
    miniatura_url TEXT,
    orden INTEGER DEFAULT 0,
    duracion INTEGER DEFAULT 0, -- duración en segundos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de progreso de videos de classroom
CREATE TABLE IF NOT EXISTS progreso_videos_classroom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos_classroom_modulo(id) ON DELETE CASCADE,
    tiempo_visto INTEGER DEFAULT 0, -- tiempo visto en segundos
    porcentaje_completado NUMERIC(5,2) DEFAULT 0, -- porcentaje de 0 a 100
    completado BOOLEAN DEFAULT FALSE,
    ultima_reproduccion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(usuario_id, video_id)
);

-- Tabla de recursos adicionales por módulo
CREATE TABLE IF NOT EXISTS recursos_classroom_modulo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID REFERENCES classroom_modulos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL, -- 'documento', 'enlace', 'archivo', etc.
    url TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_videos_classroom_modulo_id ON videos_classroom_modulo(modulo_id);
CREATE INDEX IF NOT EXISTS idx_progreso_videos_usuario ON progreso_videos_classroom(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progreso_videos_video ON progreso_videos_classroom(video_id);
CREATE INDEX IF NOT EXISTS idx_recursos_classroom_modulo ON recursos_classroom_modulo(modulo_id);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_classroom_modulos_updated_at
    BEFORE UPDATE ON classroom_modulos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_classroom_updated_at
    BEFORE UPDATE ON videos_classroom_modulo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progreso_videos_updated_at
    BEFORE UPDATE ON progreso_videos_classroom
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recursos_classroom_updated_at
    BEFORE UPDATE ON recursos_classroom_modulo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 