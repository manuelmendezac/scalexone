-- Crear la tabla usuarios si no existe
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    apellidos TEXT,
    celular TEXT,
    pais TEXT DEFAULT 'Perú',
    facebook TEXT,
    twitter TEXT,
    instagram TEXT,
    tiktok TEXT,
    membresia TEXT,
    rol TEXT DEFAULT 'user' CHECK (rol IN ('user', 'admin', 'superadmin')),
    creditos INTEGER DEFAULT 0,
    wallet TEXT,
    idioma TEXT DEFAULT 'Español',
    zona_horaria TEXT DEFAULT 'GMT-5',
    nivel INTEGER DEFAULT 1,
    cursos JSONB DEFAULT '[]'::jsonb,
    servicios JSONB DEFAULT '[]'::jsonb,
    avatar_url TEXT,
    community_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow individual user access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow admin full access" ON public.usuarios;

-- Crear políticas de acceso
CREATE POLICY "Allow individual user access"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow admin full access"
ON public.usuarios
FOR ALL
USING (
    auth.uid() IN (
        SELECT id FROM public.usuarios 
        WHERE rol IN ('admin', 'superadmin')
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM public.usuarios 
        WHERE rol IN ('admin', 'superadmin')
    )
);

-- Función para crear usuario automáticamente después del signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 