-- Crear tabla para configuraciones de usuario
CREATE TABLE IF NOT EXISTS user_config (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    show_video_slider BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear política RLS para user_config
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;

-- Política para lectura
CREATE POLICY "Users can read their own config"
    ON user_config
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para inserción
CREATE POLICY "Users can insert their own config"
    ON user_config
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para actualización
CREATE POLICY "Users can update their own config"
    ON user_config
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar el timestamp
CREATE TRIGGER update_user_config_updated_at
    BEFORE UPDATE
    ON user_config
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 