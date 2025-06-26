-- Script para crear tabla cursos compatible con marketplace y agregar datos de ejemplo
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla cursos si no existe con los campos necesarios para el marketplace
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

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_cursos_activo ON public.cursos(activo);
CREATE INDEX IF NOT EXISTS idx_cursos_community_id ON public.cursos(community_id);
CREATE INDEX IF NOT EXISTS idx_cursos_orden ON public.cursos(orden);

-- 3. Insertar cursos de ejemplo para el marketplace
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
    'Marketing Digital Avanzado',
    'Estrategias completas de marketing digital: SEO, SEM, redes sociales, email marketing y automatización. Conviértete en un experto digital.',
    249.99,
    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop',
    'Digital Masters',
    30,
    'Avanzado',
    true,
    'default',
    3,
    'Marketing Digital Avanzado',
    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop'
),
(
    'Inteligencia Artificial para Negocios',
    'Implementa IA en tu negocio: chatbots, automatización, análisis predictivo y herramientas de productividad. El futuro de los negocios está aquí.',
    399.99,
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop',
    'AI Experts',
    40,
    'Avanzado',
    true,
    'default',
    4,
    'Inteligencia Artificial para Negocios',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop'
),
(
    'Mindset Millonario',
    'Desarrolla la mentalidad y hábitos de los millonarios. Psicología del éxito, gestión financiera personal y estrategias de crecimiento personal.',
    149.99,
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&h=300&fit=crop',
    'Success Mentors',
    15,
    'Principiante',
    true,
    'default',
    5,
    'Mindset Millonario',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&h=300&fit=crop'
),
(
    'E-commerce Desde Cero',
    'Crea tu tienda online rentable: desde la selección de productos hasta la optimización de conversiones. Incluye casos de éxito y herramientas.',
    179.99,
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop',
    'E-commerce Pro',
    22,
    'Intermedio',
    true,
    'default',
    6,
    'E-commerce Desde Cero',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_cursos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_cursos_updated_at ON public.cursos;
CREATE TRIGGER update_cursos_updated_at
    BEFORE UPDATE ON public.cursos
    FOR EACH ROW
    EXECUTE FUNCTION update_cursos_updated_at();

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de seguridad
-- Política para lectura: todos pueden ver cursos activos
CREATE POLICY "Todos pueden ver cursos activos" ON public.cursos
    FOR SELECT USING (activo = true);

-- Política para inserción: solo usuarios autenticados pueden crear cursos
CREATE POLICY "Solo usuarios autenticados pueden crear cursos" ON public.cursos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para actualización: solo el creador o admins pueden editar
CREATE POLICY "Solo admins pueden editar cursos" ON public.cursos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.rol IN ('admin', 'superadmin')
        )
    );

-- Política para eliminación: solo admins pueden eliminar
CREATE POLICY "Solo admins pueden eliminar cursos" ON public.cursos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.rol IN ('admin', 'superadmin')
        )
    );

-- 8. Verificar que los datos se insertaron correctamente
SELECT 
    titulo,
    precio,
    instructor,
    nivel,
    activo
FROM public.cursos 
WHERE activo = true 
ORDER BY orden; 