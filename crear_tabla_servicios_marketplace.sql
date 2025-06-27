-- =====================================================
-- SCRIPT: Crear tabla servicios_marketplace
-- DESCRIPCIÓN: Tabla para gestionar servicios en el marketplace
-- FECHA: 2024
-- =====================================================

-- 1. Crear tabla servicios_marketplace
CREATE TABLE IF NOT EXISTS public.servicios_marketplace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    imagen_url TEXT,
    proveedor TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Consultoría',
    rating DECIMAL(3,2) DEFAULT 4.8,
    reviews INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_servicios_marketplace_activo ON public.servicios_marketplace(activo);
CREATE INDEX IF NOT EXISTS idx_servicios_marketplace_categoria ON public.servicios_marketplace(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_marketplace_precio ON public.servicios_marketplace(precio);
CREATE INDEX IF NOT EXISTS idx_servicios_marketplace_rating ON public.servicios_marketplace(rating);
CREATE INDEX IF NOT EXISTS idx_servicios_marketplace_created_at ON public.servicios_marketplace(created_at);

-- 3. Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_servicios_marketplace_updated_at 
    BEFORE UPDATE ON public.servicios_marketplace 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Configurar Row Level Security (RLS)
ALTER TABLE public.servicios_marketplace ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
-- Política para lectura: todos pueden ver servicios activos
CREATE POLICY "servicios_marketplace_select_policy" ON public.servicios_marketplace
    FOR SELECT USING (activo = true OR auth.role() = 'authenticated');

-- Política para insertar: solo usuarios autenticados
CREATE POLICY "servicios_marketplace_insert_policy" ON public.servicios_marketplace
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para actualizar: solo usuarios autenticados
CREATE POLICY "servicios_marketplace_update_policy" ON public.servicios_marketplace
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para eliminar: solo usuarios autenticados
CREATE POLICY "servicios_marketplace_delete_policy" ON public.servicios_marketplace
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Crear bucket de storage para imágenes de servicios (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('servicios-marketplace', 'servicios-marketplace', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Configurar políticas de storage
-- Política para ver imágenes: público
CREATE POLICY "servicios_images_select_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'servicios-marketplace');

-- Política para subir imágenes: usuarios autenticados
CREATE POLICY "servicios_images_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'servicios-marketplace' 
        AND auth.role() = 'authenticated'
    );

-- Política para actualizar imágenes: usuarios autenticados
CREATE POLICY "servicios_images_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'servicios-marketplace' 
        AND auth.role() = 'authenticated'
    );

-- Política para eliminar imágenes: usuarios autenticados
CREATE POLICY "servicios_images_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'servicios-marketplace' 
        AND auth.role() = 'authenticated'
    );

-- 8. Insertar servicios de ejemplo
INSERT INTO public.servicios_marketplace (
    titulo, 
    descripcion, 
    precio, 
    imagen_url, 
    proveedor, 
    categoria, 
    rating, 
    reviews, 
    activo
) VALUES 
(
    'Consultoría Estratégica 1:1',
    'Sesión personalizada de estrategia empresarial con expertos en escalabilidad y crecimiento de negocios digitales.',
    150.00,
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=300&fit=crop',
    'ScaleXone Consulting',
    'Consultoría',
    4.9,
    127,
    true
),
(
    'Diseño de Funnel Completo',
    'Creación de funnel de ventas optimizado desde landing hasta checkout con estrategias de conversión probadas.',
    500.00,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
    'Funnel Masters',
    'Marketing',
    4.8,
    89,
    true
),
(
    'Automatización WhatsApp Business',
    'Setup completo de chatbot y automatización para WhatsApp Business con integración CRM.',
    300.00,
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
    'AutoBot Pro',
    'Automatización',
    4.7,
    156,
    true
),
(
    'Desarrollo Web Personalizado',
    'Desarrollo de sitio web o aplicación web completamente personalizada con tecnologías modernas.',
    800.00,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop',
    'DevMasters',
    'Desarrollo',
    4.9,
    203,
    true
),
(
    'Coaching de Liderazgo',
    'Programa de coaching personalizado para desarrollar habilidades de liderazgo y gestión de equipos.',
    250.00,
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    'Leadership Pro',
    'Coaching',
    4.8,
    94,
    true
),
(
    'Diseño de Identidad Visual',
    'Creación completa de identidad visual: logo, colores, tipografías y manual de marca.',
    400.00,
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    'Design Studio',
    'Diseño',
    4.7,
    112,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 9. Verificar la configuración
DO $$
BEGIN
    -- Verificar que la tabla existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'servicios_marketplace') THEN
        RAISE NOTICE '✅ Tabla servicios_marketplace creada correctamente';
    ELSE
        RAISE NOTICE '❌ Error: Tabla servicios_marketplace no encontrada';
    END IF;
    
    -- Verificar que el bucket existe
    IF EXISTS (SELECT FROM storage.buckets WHERE id = 'servicios-marketplace') THEN
        RAISE NOTICE '✅ Bucket servicios-marketplace configurado correctamente';
    ELSE
        RAISE NOTICE '❌ Error: Bucket servicios-marketplace no encontrado';
    END IF;
    
    -- Contar servicios insertados
    DECLARE
        count_servicios INTEGER;
    BEGIN
        SELECT COUNT(*) INTO count_servicios FROM public.servicios_marketplace;
        RAISE NOTICE '✅ Servicios insertados: %', count_servicios;
    END;
END $$;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- 1. Ejecuta este script completo en el SQL Editor de Supabase
-- 2. Verifica que aparezcan los mensajes de confirmación
-- 3. El panel de administración ya estará funcional
-- 4. Los servicios de ejemplo aparecerán en el marketplace
-- ===================================================== 