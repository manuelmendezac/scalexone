-- 1. Asegurarse de que la tabla video_slides tenga RLS habilitado
ALTER TABLE public.video_slides ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow public read access" ON public.video_slides;
DROP POLICY IF EXISTS "Allow admin full access" ON public.video_slides;

-- 3. Crear política para que todos puedan ver videos visibles
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

-- 4. Crear política para que los administradores tengan acceso total
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

-- 5. Asegurarse de que la tabla user_config tenga RLS habilitado
ALTER TABLE public.user_config ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas existentes de user_config
DROP POLICY IF EXISTS "Allow individual read access" ON public.user_config;
DROP POLICY IF EXISTS "Allow individual write access" ON public.user_config;

-- 7. Crear políticas para user_config
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

-- 8. Asegurarse de que las columnas necesarias existan
DO $$ 
BEGIN
  -- Agregar columna is_visible si no existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'video_slides' 
    AND column_name = 'is_visible'
  ) THEN
    ALTER TABLE public.video_slides ADD COLUMN is_visible BOOLEAN DEFAULT true;
  END IF;

  -- Agregar columna order si no existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'video_slides' 
    AND column_name = 'order'
  ) THEN
    ALTER TABLE public.video_slides ADD COLUMN "order" INTEGER;
    -- Actualizar orden basado en created_at
    UPDATE public.video_slides
    SET "order" = sub.row_number
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
      FROM public.video_slides
    ) sub
    WHERE video_slides.id = sub.id;
  END IF;
END $$; 