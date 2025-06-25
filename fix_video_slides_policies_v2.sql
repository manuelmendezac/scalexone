-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public read access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow admin full access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow service role full access" ON public.video_slides;

-- Asegurarse de que la función is_admin existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        EXECUTE 'CREATE FUNCTION is_admin(user_id UUID)
        RETURNS BOOLEAN AS $BODY$
        BEGIN
            RETURN EXISTS (
                SELECT 1 
                FROM public.usuarios
                WHERE id = user_id 
                AND rol IN (''admin'', ''superadmin'')
            );
        END;
        $BODY$ LANGUAGE plpgsql SECURITY DEFINER';
    END IF;
END $$;

-- Política para lectura pública (videos visibles)
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

-- Política para que los admins puedan hacer todo
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

-- Política específica para el service role
CREATE POLICY "Allow service role full access"
ON public.video_slides
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.video_slides ENABLE ROW LEVEL SECURITY;

-- Dar permisos necesarios
GRANT ALL ON public.video_slides TO authenticated;
GRANT ALL ON public.video_slides TO service_role;

-- Asegurarse de que la tabla tiene las columnas necesarias
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'video_slides' 
        AND column_name = 'is_visible'
    ) THEN
        ALTER TABLE public.video_slides ADD COLUMN is_visible BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'video_slides' 
        AND column_name = 'order'
    ) THEN
        ALTER TABLE public.video_slides ADD COLUMN "order" INTEGER DEFAULT 0;
    END IF;
END $$; 