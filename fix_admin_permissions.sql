-- 1. Agregar política para que los administradores puedan ver todos los usuarios
DROP POLICY IF EXISTS "Allow admin full access" ON public.usuarios;

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

-- 2. Asegurarse de que la tabla usuarios tenga RLS habilitado
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Asegurarse de que la columna rol tenga los tipos correctos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'usuarios' 
    AND column_name = 'rol'
  ) THEN
    ALTER TABLE public.usuarios ADD COLUMN rol TEXT DEFAULT 'user';
  END IF;
END $$; 