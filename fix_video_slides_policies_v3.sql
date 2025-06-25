-- 1. Actualizar la estructura de la tabla video_slides
ALTER TABLE public.video_slides 
ADD COLUMN IF NOT EXISTS button_text TEXT,
ADD COLUMN IF NOT EXISTS button_url TEXT;

-- 2. Eliminar todas las políticas existentes y simplificar
DROP POLICY IF EXISTS "Allow public read access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow admin full access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow service role full access" ON public.video_slides;

-- 3. Crear una política simple que permita todas las operaciones
CREATE POLICY "allow_all_video_slides"
ON public.video_slides
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Asegurarse de que los permisos están correctamente configurados
GRANT ALL ON public.video_slides TO authenticated;
GRANT ALL ON public.video_slides TO service_role;

-- 5. Verificar que RLS está habilitado
ALTER TABLE public.video_slides ENABLE ROW LEVEL SECURITY; 