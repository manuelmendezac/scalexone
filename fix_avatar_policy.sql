-- Elimina la política si ya existe para evitar errores
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

-- Crea la política para permitir lectura pública en el bucket 'avatars'
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' ); 