-- Script para agregar campos de personalización a las suscripciones
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar nuevas columnas a la tabla suscripciones
ALTER TABLE IF EXISTS suscripciones 
ADD COLUMN IF NOT EXISTS titulo_personalizado TEXT,
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- 2. Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN suscripciones.titulo_personalizado IS 'Título personalizado para la suscripción (opcional)';
COMMENT ON COLUMN suscripciones.descripcion IS 'Descripción personalizada de la suscripción (opcional)';
COMMENT ON COLUMN suscripciones.imagen_url IS 'URL de imagen personalizada para la suscripción (opcional)';

-- 3. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_suscripciones_titulo ON suscripciones(titulo_personalizado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_imagen ON suscripciones(imagen_url);

-- 4. Actualizar políticas RLS para permitir que los admins gestionen estos campos
-- Política para permitir a los admins actualizar los campos de personalización
CREATE POLICY IF NOT EXISTS "Admins can update suscripcion personalization" ON suscripciones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- 5. Verificar las columnas agregadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'suscripciones' 
AND column_name IN ('titulo_personalizado', 'descripcion', 'imagen_url')
ORDER BY column_name;

-- 6. Mensaje de confirmación
SELECT 'Campos de personalización agregados exitosamente a la tabla suscripciones' as resultado; 