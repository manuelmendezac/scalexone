-- 1. Crear la tabla usuarios si no existe
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

-- 2. Crear la tabla video_slides si no existe
CREATE TABLE IF NOT EXISTS public.video_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    video_type TEXT CHECK (video_type IN ('youtube', 'vimeo')),
    is_visible BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear triggers para updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_slides_updated_at ON public.video_slides;
CREATE TRIGGER update_video_slides_updated_at
    BEFORE UPDATE ON public.video_slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Crear función is_admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.usuarios
        WHERE id = user_id 
        AND rol IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Configurar RLS para usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 7. Eliminar políticas existentes de usuarios
DROP POLICY IF EXISTS "Allow individual user access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow admin full access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow public read access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to delete their own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.usuarios;
DROP POLICY IF EXISTS "Allow service role full access" ON public.usuarios;

-- 8. Crear políticas para usuarios
CREATE POLICY "Allow users to read their own data"
ON public.usuarios
FOR SELECT
USING (
    auth.uid() = id 
    OR 
    is_admin(auth.uid())
    OR
    auth.jwt()->>'role' = 'service_role'
);

CREATE POLICY "Allow admin full access"
ON public.usuarios
FOR ALL
USING (
    is_admin(auth.uid())
    OR 
    auth.jwt()->>'role' = 'service_role'
)
WITH CHECK (
    is_admin(auth.uid())
    OR 
    auth.jwt()->>'role' = 'service_role'
);

CREATE POLICY "Allow users to update their own data"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users"
ON public.usuarios
FOR INSERT
WITH CHECK (
    auth.uid() = id 
    OR 
    auth.jwt()->>'role' = 'service_role'
    OR 
    is_admin(auth.uid())
);

-- 9. Configurar RLS para video_slides
ALTER TABLE public.video_slides ENABLE ROW LEVEL SECURITY;

-- 10. Eliminar políticas existentes de video_slides
DROP POLICY IF EXISTS "Allow public read access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow admin full access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow service role full access" ON public.video_slides;

-- 11. Crear políticas para video_slides
CREATE POLICY "Allow public read access"
ON public.video_slides
FOR SELECT
USING (
    is_visible = true 
    OR 
    is_admin(auth.uid())
    OR
    auth.jwt()->>'role' = 'service_role'
);

CREATE POLICY "Allow admin full access"
ON public.video_slides
FOR ALL
USING (
    is_admin(auth.uid())
    OR 
    auth.jwt()->>'role' = 'service_role'
)
WITH CHECK (
    is_admin(auth.uid())
    OR 
    auth.jwt()->>'role' = 'service_role'
);

-- 12. Dar permisos necesarios
GRANT ALL ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;
GRANT ALL ON public.video_slides TO authenticated;
GRANT ALL ON public.video_slides TO service_role;

-- 13. Configurar trigger para crear usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 