-- Primero, eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Allow individual user access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow admin full access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow public read access" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow users to delete their own data" ON public.usuarios;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.usuarios;
DROP POLICY IF EXISTS "Allow service role full access" ON public.usuarios;

-- Crear una función para verificar si un usuario es admin
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

-- Política para lectura
CREATE POLICY "Allow users to read their own data"
ON public.usuarios
FOR SELECT
USING (
    auth.uid() = id 
    OR 
    is_admin(auth.uid())
);

-- Política para que los admins puedan hacer todo
CREATE POLICY "Allow admin full access"
ON public.usuarios
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Política para que los usuarios normales actualicen sus datos
CREATE POLICY "Allow users to update their own data"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para permitir inserciones desde el service role
CREATE POLICY "Allow service role full access"
ON public.usuarios
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Política para que los usuarios se registren (más permisiva)
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

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Dar permisos necesarios
GRANT ALL ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;

-- Reiniciar la secuencia de triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 