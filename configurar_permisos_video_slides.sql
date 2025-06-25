-- Habilitar RLS en las tablas
ALTER TABLE public.video_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_config ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow public read access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow admin full access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow individual read access" ON public.user_config;
DROP POLICY IF EXISTS "Allow individual write access" ON public.user_config;
DROP POLICY IF EXISTS "Allow individual update access" ON public.user_config;

-- Políticas para video_slides
CREATE POLICY "Allow public read access"
ON public.video_slides
FOR SELECT
USING (
  is_visible = true OR
  auth.uid() IN (
    SELECT id FROM public.usuarios 
    WHERE rol IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Allow admin full access"
ON public.video_slides
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

-- Políticas para user_config
CREATE POLICY "Allow individual read access"
ON public.user_config
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow individual write access"
ON public.user_config
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual update access"
ON public.user_config
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Asegurarse de que los registros existentes tengan un orden
UPDATE public.video_slides
SET "order" = sub.row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
  FROM public.video_slides
  WHERE "order" IS NULL
) sub
WHERE video_slides.id = sub.id
AND video_slides."order" IS NULL; 