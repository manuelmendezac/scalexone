-- Agregar columna recompensa_reclamada a la tabla progreso_videos_classroom
ALTER TABLE progreso_videos_classroom 
ADD COLUMN IF NOT EXISTS recompensa_reclamada BOOLEAN DEFAULT FALSE;

-- Crear tabla de progreso de módulos de classroom
CREATE TABLE IF NOT EXISTS progreso_modulos_classroom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID REFERENCES classroom_modulos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    videos_completados INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    recompensa_reclamada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(modulo_id, usuario_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_progreso_modulos_classroom_usuario ON progreso_modulos_classroom(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progreso_modulos_classroom_modulo ON progreso_modulos_classroom(modulo_id);
CREATE INDEX IF NOT EXISTS idx_progreso_videos_classroom_recompensa ON progreso_videos_classroom(recompensa_reclamada);

-- Trigger para actualizar updated_at en progreso_modulos_classroom
CREATE TRIGGER update_progreso_modulos_classroom_updated_at
    BEFORE UPDATE ON progreso_modulos_classroom
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en progreso_videos_classroom (si no existe)
DROP TRIGGER IF EXISTS update_progreso_videos_classroom_updated_at ON progreso_videos_classroom;
CREATE TRIGGER update_progreso_videos_classroom_updated_at
    BEFORE UPDATE ON progreso_videos_classroom
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 