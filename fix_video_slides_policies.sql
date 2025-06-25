-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public read access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow admin full access" ON public.video_slides;

-- Crear nuevas políticas usando la función is_admin
CREATE POLICY "Allow public read access"
ON public.video_slides
FOR SELECT
USING (
    is_visible = true 
    OR 
    is_admin(auth.uid())
);

CREATE POLICY "Allow admin full access"
ON public.video_slides
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.video_slides ENABLE ROW LEVEL SECURITY;

-- Dar permisos necesarios
GRANT ALL ON public.video_slides TO authenticated;
GRANT ALL ON public.video_slides TO service_role; 