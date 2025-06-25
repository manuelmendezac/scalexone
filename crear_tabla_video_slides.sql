-- Crear tabla para los slides de video
CREATE TABLE IF NOT EXISTS video_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button_text TEXT,
  button_url TEXT,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'vimeo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Crear política de seguridad para lectura pública
CREATE POLICY "Permitir lectura pública de video_slides" ON video_slides
  FOR SELECT USING (true);

-- Crear política de seguridad para escritura solo por administradores
CREATE POLICY "Permitir escritura solo para administradores en video_slides" ON video_slides
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE rol = 'admin'
    )
  );

-- Habilitar RLS
ALTER TABLE video_slides ENABLE ROW LEVEL SECURITY;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_video_slides()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('UTC'::TEXT, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_slides_updated_at
    BEFORE UPDATE
    ON video_slides
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_video_slides(); 