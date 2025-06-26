-- =====================================================
-- CONFIGURAR STORAGE BUCKETS PARA COMUNIDADES
-- Script para crear buckets de almacenamiento de imágenes
-- =====================================================

-- 1. VERIFICAR BUCKETS EXISTENTES
SELECT 'BUCKETS EXISTENTES' as paso;
SELECT name, public, created_at FROM storage.buckets ORDER BY name;

-- 2. CREAR BUCKET PARA LOGOS DE COMUNIDAD
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-logos', 'community-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CREAR BUCKET PARA BANNERS DE COMUNIDAD  
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-banners', 'community-banners', true)
ON CONFLICT (id) DO NOTHING;

-- 4. VERIFICAR BUCKETS CREADOS
SELECT 'BUCKETS DESPUÉS DE CREACIÓN' as paso;
SELECT name, public, created_at FROM storage.buckets ORDER BY name;

-- 5. CONFIGURAR POLÍTICAS DE STORAGE PARA LOGOS
-- Permitir a usuarios autenticados subir archivos
INSERT INTO storage.policies (bucket_id, name, definition, check_expression, command)
VALUES (
  'community-logos',
  'Usuarios pueden subir logos',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'INSERT'
) ON CONFLICT DO NOTHING;

-- Permitir a todos ver logos (público)
INSERT INTO storage.policies (bucket_id, name, definition, check_expression, command)
VALUES (
  'community-logos',
  'Logos son públicos',
  'true',
  'true',
  'SELECT'
) ON CONFLICT DO NOTHING;

-- Permitir a owners actualizar logos
INSERT INTO storage.policies (bucket_id, name, definition, check_expression, command)
VALUES (
  'community-logos',
  'Owners pueden actualizar logos',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'UPDATE'
) ON CONFLICT DO NOTHING;

-- 6. CONFIGURAR POLÍTICAS DE STORAGE PARA BANNERS
-- Permitir a usuarios autenticados subir archivos
INSERT INTO storage.policies (bucket_id, name, definition, check_expression, command)
VALUES (
  'community-banners',
  'Usuarios pueden subir banners',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'INSERT'
) ON CONFLICT DO NOTHING;

-- Permitir a todos ver banners (público)
INSERT INTO storage.policies (bucket_id, name, definition, check_expression, command)
VALUES (
  'community-banners',
  'Banners son públicos',
  'true',
  'true',
  'SELECT'
) ON CONFLICT DO NOTHING;

-- Permitir a owners actualizar banners
INSERT INTO storage.policies (bucket_id, name, definition, check_expression, command)
VALUES (
  'community-banners',
  'Owners pueden actualizar banners',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'UPDATE'
) ON CONFLICT DO NOTHING;

-- 7. VERIFICAR POLÍTICAS CREADAS
SELECT 'POLÍTICAS DE STORAGE' as paso;
SELECT bucket_id, name, command FROM storage.policies 
WHERE bucket_id IN ('community-logos', 'community-banners')
ORDER BY bucket_id, command; 