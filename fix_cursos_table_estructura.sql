-- Script de diagnóstico y reparación para tabla cursos
-- Ejecutar paso a paso en Supabase SQL Editor

-- ===== PASO 1: DIAGNÓSTICO =====
-- Verificar si la tabla existe y qué columnas tiene
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cursos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===== PASO 2: VERIFICAR BUCKET DE STORAGE =====
SELECT 
    id, 
    name, 
    public,
    created_at
FROM storage.buckets 
WHERE name = 'cursos';

-- ===== PASO 3: REPARACIÓN COMPLETA =====

-- 3A. Eliminar tabla si existe (CUIDADO: esto borra todos los datos)
-- DROP TABLE IF EXISTS public.cursos CASCADE;

-- 3B. Crear tabla desde cero con estructura correcta
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
    -- Campos de compatibilidad
    nombre TEXT,
    imagen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3C. Agregar columnas faltantes si la tabla ya existe
DO $$ 
BEGIN
    -- Verificar y agregar duracion_horas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'duracion_horas') THEN
        ALTER TABLE public.cursos ADD COLUMN duracion_horas INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna duracion_horas agregada';
    ELSE
        RAISE NOTICE 'Columna duracion_horas ya existe';
    END IF;
    
    -- Verificar y agregar activo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'activo') THEN
        ALTER TABLE public.cursos ADD COLUMN activo BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna activo agregada';
    ELSE
        RAISE NOTICE 'Columna activo ya existe';
    END IF;
    
    -- Verificar y agregar imagen_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'imagen_url') THEN
        ALTER TABLE public.cursos ADD COLUMN imagen_url TEXT;
        RAISE NOTICE 'Columna imagen_url agregada';
    ELSE
        RAISE NOTICE 'Columna imagen_url ya existe';
    END IF;
    
    -- Verificar y agregar community_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'community_id') THEN
        ALTER TABLE public.cursos ADD COLUMN community_id TEXT DEFAULT 'default';
        RAISE NOTICE 'Columna community_id agregada';
    ELSE
        RAISE NOTICE 'Columna community_id ya existe';
    END IF;
    
    -- Verificar y agregar orden
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'orden') THEN
        ALTER TABLE public.cursos ADD COLUMN orden INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna orden agregada';
    ELSE
        RAISE NOTICE 'Columna orden ya existe';
    END IF;
    
    -- Verificar y agregar nombre (compatibilidad)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'nombre') THEN
        ALTER TABLE public.cursos ADD COLUMN nombre TEXT;
        RAISE NOTICE 'Columna nombre agregada';
    ELSE
        RAISE NOTICE 'Columna nombre ya existe';
    END IF;
    
    -- Verificar y agregar imagen (compatibilidad)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'imagen') THEN
        ALTER TABLE public.cursos ADD COLUMN imagen TEXT;
        RAISE NOTICE 'Columna imagen agregada';
    ELSE
        RAISE NOTICE 'Columna imagen ya existe';
    END IF;
    
    -- Verificar y agregar created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'created_at') THEN
        ALTER TABLE public.cursos ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
        RAISE NOTICE 'Columna created_at agregada';
    ELSE
        RAISE NOTICE 'Columna created_at ya existe';
    END IF;
    
    -- Verificar y agregar updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cursos' AND column_name = 'updated_at') THEN
        ALTER TABLE public.cursos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
        RAISE NOTICE 'Columna updated_at agregada';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al agregar columnas: %', SQLERRM;
END $$;

-- 3D. Crear índices
CREATE INDEX IF NOT EXISTS idx_cursos_activo ON public.cursos(activo);
CREATE INDEX IF NOT EXISTS idx_cursos_community_id ON public.cursos(community_id);
CREATE INDEX IF NOT EXISTS idx_cursos_orden ON public.cursos(orden);

-- ===== PASO 4: CONFIGURAR STORAGE =====

-- 4A. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cursos', 'cursos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 4B. Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Todos pueden ver imágenes de cursos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar imágenes" ON storage.objects;

-- 4C. Crear políticas de storage
CREATE POLICY "Todos pueden ver imágenes de cursos" ON storage.objects
    FOR SELECT USING (bucket_id = 'cursos');

CREATE POLICY "Usuarios autenticados pueden subir imágenes" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'cursos' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Usuarios autenticados pueden actualizar imágenes" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'cursos' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Usuarios autenticados pueden eliminar imágenes" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'cursos' AND 
        auth.role() = 'authenticated'
    );

-- ===== PASO 5: CONFIGURAR RLS PARA TABLA =====

-- 5A. Habilitar RLS
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- 5B. Eliminar políticas existentes
DROP POLICY IF EXISTS "Todos pueden ver cursos activos" ON public.cursos;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden crear cursos" ON public.cursos;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden editar cursos" ON public.cursos;
DROP POLICY IF EXISTS "Solo usuarios autenticados pueden eliminar cursos" ON public.cursos;

-- 5C. Crear nuevas políticas
CREATE POLICY "Todos pueden ver cursos activos" ON public.cursos
    FOR SELECT USING (activo = true OR activo IS NULL);

CREATE POLICY "Solo usuarios autenticados pueden crear cursos" ON public.cursos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden editar cursos" ON public.cursos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden eliminar cursos" ON public.cursos
    FOR DELETE USING (auth.role() = 'authenticated');

-- ===== PASO 6: AGREGAR DATOS DE PRUEBA =====

-- 6A. Limpiar datos existentes (opcional)
-- DELETE FROM public.cursos;

-- 6B. Insertar cursos de ejemplo
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
),
(
    'Automatización con IA para Negocios',
    'Implementa sistemas de inteligencia artificial para automatizar procesos y aumentar la productividad de tu negocio.',
    399.99,
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop',
    'ScaleXone Team',
    30,
    'Avanzado',
    true,
    'default',
    3,
    'Automatización con IA para Negocios',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop'
)
ON CONFLICT (id) DO NOTHING;

-- ===== PASO 7: VERIFICACIÓN FINAL =====

-- 7A. Verificar estructura de tabla
SELECT 
    'ESTRUCTURA DE TABLA' as tipo,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cursos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7B. Verificar datos
SELECT 
    'DATOS DE CURSOS' as tipo,
    COUNT(*) as total_cursos,
    COUNT(CASE WHEN activo = true THEN 1 END) as cursos_activos,
    COUNT(CASE WHEN duracion_horas > 0 THEN 1 END) as cursos_con_duracion
FROM public.cursos;

-- 7C. Verificar bucket
SELECT 
    'BUCKET DE STORAGE' as tipo,
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'cursos';

-- 7D. Probar consulta del componente
SELECT 
    'PRUEBA CONSULTA COMPONENTE' as tipo,
    id,
    titulo,
    descripcion,
    precio,
    imagen_url,
    instructor,
    duracion_horas,
    nivel,
    activo,
    community_id,
    orden
FROM public.cursos
ORDER BY orden, created_at;
