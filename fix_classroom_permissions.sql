-- =================================================================
-- FIX: Políticas de Seguridad para Classroom
-- Este script corrige los errores 403 (Forbidden) y 404 (Not Found)
-- al permitir que los usuarios guarden su propio progreso.
-- =================================================================

-- 1. Políticas para la tabla de progreso de VIDEOS
-- -----------------------------------------------------------------
-- Habilitar RLS si no está habilitada
ALTER TABLE public.progreso_videos_classroom ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.progreso_videos_classroom;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.progreso_videos_classroom;

-- Política de INSERCIÓN: Un usuario solo puede insertar una fila con su propio ID.
CREATE POLICY "Permitir a los usuarios insertar su propio progreso de video"
ON public.progreso_videos_classroom
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- Política de ACTUALIZACIÓN: Un usuario solo puede actualizar las filas que le pertenecen.
CREATE POLICY "Permitir a los usuarios actualizar su propio progreso de video"
ON public.progreso_videos_classroom
FOR UPDATE
USING (auth.uid() = usuario_id);

-- Política de LECTURA: Un usuario solo puede leer su propio progreso (opcional, pero buena práctica).
CREATE POLICY "Permitir a los usuarios leer su propio progreso de video"
ON public.progreso_videos_classroom
FOR SELECT
USING (auth.uid() = usuario_id);


-- 2. Políticas para la tabla de progreso de MÓDULOS
-- -----------------------------------------------------------------
-- Habilitar RLS si no está habilitada
ALTER TABLE public.modulos_completados ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.modulos_completados;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.modulos_completados;

-- Política de INSERCIÓN: Un usuario solo puede insertar una fila con su propio ID.
CREATE POLICY "Permitir a los usuarios insertar sus modulos completados"
ON public.modulos_completados
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- Política de ACTUALIZACIÓN: Un usuario solo puede actualizar las filas que le pertenecen.
CREATE POLICY "Permitir a los usuarios actualizar sus modulos completados"
ON public.modulos_completados
FOR UPDATE
USING (auth.uid() = usuario_id);

-- Política de LECTURA: Un usuario solo puede leer su propio progreso (opcional, pero buena práctica).
CREATE POLICY "Permitir a los usuarios leer sus modulos completados"
ON public.modulos_completados
FOR SELECT
USING (auth.uid() = usuario_id);

-- =================================================================
-- Fin del script
-- ================================================================= 