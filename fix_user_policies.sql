-- 1. Habilitar Row Level Security (RLS) en la tabla 'usuarios'
-- Importante: Sin esto, ninguna política tendrá efecto.
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para evitar conflictos (opcional, pero recomendado)
DROP POLICY IF EXISTS "Allow individual user update access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow individual user select access" ON public.usuarios;

-- 3. Crear política para que los usuarios puedan ACTUALIZAR su propio perfil
CREATE POLICY "Allow individual user update access"
ON public.usuarios FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Crear política para que los usuarios puedan LEER su propio perfil
CREATE POLICY "Allow individual user select access"
ON public.usuarios FOR SELECT
USING (auth.uid() = id); 