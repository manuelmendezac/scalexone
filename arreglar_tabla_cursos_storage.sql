-- Script para arreglar la tabla cursos y configurar storage
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla cursos si no existe o agregar columnas faltantes
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) DEFAULT 0,
    imagen_url TEXT,
    instructor TEXT DEFAULT 'ScaleXone',
    duracion_horas INTEGER DEFAULT 0,
    nivel TEXT DEFAULT 'Principiante' CHECK (nivel IN ('Principiante', 'Intermedio', 'Avanzado')),
    activo BOOLEAN DEFAULT true,
    community_id TEXT DEFAULT 'default',
    orden INTEGER DEFAULT 0,
    -- Campos adicionales para compatibilidad
    nombre TEXT, -- Para compatibilidad con CursosAdminPanel
    imagen TEXT, -- Para compatibilidad con CursosAdminPanel
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Agregar columnas si no existen (para tablas existentes)
DO $$ 
BEGIN
    -- Agregar columna activo si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'activo') THEN
        ALTER TABLE public.cursos ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
    
    -- Agregar columna imagen_url si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'imagen_url') THEN
        ALTER TABLE public.cursos ADD COLUMN imagen_url TEXT;
    END IF;
    
    -- Agregar columna community_id si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'community_id') THEN
        ALTER TABLE public.cursos ADD COLUMN community_id TEXT DEFAULT 'default';
    END IF;
    
    -- Agregar columna orden si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'orden') THEN
        ALTER TABLE public.cursos ADD COLUMN orden INTEGER DEFAULT 0;
    END IF;
    
    -- Agregar campos de compatibilidad si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'nombre') THEN
        ALTER TABLE public.cursos ADD COLUMN nombre TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'imagen') THEN
        ALTER TABLE public.cursos ADD COLUMN imagen TEXT;
    END IF;
    
    -- Agregar timestamps si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'created_at') THEN
        ALTER TABLE public.cursos ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.cursos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_cursos_activo ON public.cursos(activo);
CREATE INDEX IF NOT EXISTS idx_cursos_community_id ON public.cursos(community_id);
CREATE INDEX IF NOT EXISTS idx_cursos_orden ON public.cursos(orden);

-- 4. Crear bucket de storage para imágenes de cursos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cursos', 'cursos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Crear políticas de storage para el bucket cursos
-- Política para leer archivos (público)
CREATE POLICY "Todos pueden ver imágenes de cursos" ON storage.objects
    FOR SELECT USING (bucket_id = 'cursos');

-- Política para subir archivos (usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden subir imágenes" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'cursos' AND 
        auth.role() = 'authenticated'
    );

-- Política para actualizar archivos (usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden actualizar imágenes" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'cursos' AND 
        auth.role() = 'authenticated'
    );

-- Política para eliminar archivos (usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden eliminar imágenes" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'cursos' AND 
        auth.role() = 'authenticated'
    );

-- 6. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_cursos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_cursos_updated_at ON public.cursos;
CREATE TRIGGER update_cursos_updated_at
    BEFORE UPDATE ON public.cursos
    FOR EACH ROW
    EXECUTE FUNCTION update_cursos_updated_at();

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas de seguridad para la tabla cursos
-- Política para lectura: todos pueden ver cursos activos
DROP POLICY IF EXISTS "Todos pueden ver cursos activos" ON public.cursos;
CREATE POLICY "Todos pueden ver cursos activos" ON public.cursos
    FOR SELECT USING (activo = true OR activo IS NULL);

-- Política para inserción: solo usuarios autenticados pueden crear cursos
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden crear cursos" ON public.cursos;
CREATE POLICY "Solo usuarios autenticados pueden crear cursos" ON public.cursos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para actualización: solo usuarios autenticados pueden editar
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden editar cursos" ON public.cursos;
CREATE POLICY "Solo usuarios autenticados pueden editar cursos" ON public.cursos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para eliminación: solo usuarios autenticados pueden eliminar
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar cursos" ON public.cursos;
CREATE POLICY "Solo usuarios autenticados pueden eliminar cursos" ON public.cursos
    FOR DELETE USING (auth.role() = 'authenticated');

-- 10. Insertar cursos de ejemplo si la tabla está vacía
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM public.cursos) = 0 THEN
        INSERT INTO public.cursos (
            titulo, 
            descripcion, 
            precio, 
            imagen_url, 
            instructor, 
            duracion_horas, 
            nivel, 
            activo, 
            community_id,
            orden,
            nombre,
            imagen
        ) VALUES 
        (
            'Domina el Trading de Criptomonedas',
            'Aprende estrategias avanzadas de trading, análisis técnico y gestión de riesgo en el mercado de criptomonedas. Incluye herramientas profesionales y casos de estudio reales.',
            299.99,
            'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop',
            'Manuel Méndez',
            25,
            'Intermedio',
            true,
            'default',
            1,
            'Domina el Trading de Criptomonedas',
            'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop'
        ),
        (
            'Construcción de Funnels de Ventas',
            'Diseña y optimiza funnels de conversión que multipliquen tus ventas. Desde la captación hasta el cierre, domina cada etapa del embudo de ventas.',
            199.99,
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
            'ScaleXone Academy',
            18,
            'Principiante',
            true,
            'default',
            2,
            'Construcción de Funnels de Ventas',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop'
        );
    END IF;
END $$;

-- 11. Verificar que todo esté configurado correctamente
SELECT 
    'Tabla cursos configurada correctamente' as status,
    COUNT(*) as total_cursos
FROM public.cursos;

SELECT 
    'Bucket cursos configurado' as status,
    name,
    public
FROM storage.buckets 
WHERE id = 'cursos'; 