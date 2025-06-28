-- =====================================================
-- 🛒 OFERTAS MARKETPLACE SCALEXONE - VERSIÓN SEGURA
-- =====================================================
-- Script simplificado que solo usa columnas básicas existentes

-- 1. CREAR TABLA OFERTAS MARKETPLACE
CREATE TABLE IF NOT EXISTS ofertas_marketplace (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Información básica (campos seguros)
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_producto VARCHAR(50) DEFAULT 'curso' CHECK (tipo_producto IN ('curso', 'servicio', 'herramienta', 'producto_fisico')),
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    imagen_url TEXT,
    proveedor VARCHAR(100) DEFAULT 'ScaleXone',
    categoria VARCHAR(100) DEFAULT 'Cursos de Trading',
    
    -- Métricas básicas
    rating DECIMAL(3,2) DEFAULT 4.8,
    reviews INTEGER DEFAULT 0,
    
    -- Sistema de afiliación
    afilible BOOLEAN DEFAULT true,
    comision_nivel1 DECIMAL(5,2) DEFAULT 25.00,
    comision_nivel2 DECIMAL(5,2) DEFAULT 15.00,
    comision_nivel3 DECIMAL(5,2) DEFAULT 10.00,
    
    -- Estados
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    
    -- Campos específicos para cursos (opcionales)
    duracion_horas INTEGER,
    nivel VARCHAR(50),
    instructor VARCHAR(100),
    
    -- Timestamps
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MIGRAR DESDE SERVICIOS_MARKETPLACE (solo campos básicos)
INSERT INTO ofertas_marketplace (
    titulo, 
    descripcion, 
    tipo_producto, 
    precio, 
    imagen_url, 
    proveedor, 
    categoria,
    rating, 
    reviews,
    activo,
    fecha_creacion
)
SELECT 
    titulo,
    descripcion,
    'servicio' as tipo_producto,
    precio,
    imagen_url,
    proveedor,
    categoria,
    COALESCE(rating, 4.8),
    COALESCE(reviews, 0),
    COALESCE(activo, true),
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM servicios_marketplace 
WHERE COALESCE(activo, true) = true
ON CONFLICT DO NOTHING;

-- 3. MIGRAR DESDE CURSOS (solo campos básicos)
INSERT INTO ofertas_marketplace (
    titulo, 
    descripcion, 
    tipo_producto, 
    precio, 
    imagen_url, 
    proveedor,
    categoria,
    duracion_horas,
    nivel,
    instructor,
    activo,
    fecha_creacion
)
SELECT 
    titulo,
    descripcion,
    'curso' as tipo_producto,
    COALESCE(precio, 0),
    imagen_url,
    COALESCE(instructor, 'ScaleXone'),
    'Cursos de Trading' as categoria,
    duracion_horas,
    nivel,
    instructor,
    COALESCE(activo, true),
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM cursos 
WHERE COALESCE(activo, true) = true
ON CONFLICT DO NOTHING;

-- 4. INSERTAR OFERTAS DE EJEMPLO GARANTIZADAS
INSERT INTO ofertas_marketplace (
    titulo, descripcion, tipo_producto, precio, categoria, 
    duracion_horas, nivel, instructor, destacado, orden
) VALUES 
(
    'Masterclass Trading Avanzado 2024',
    'Curso completo de trading profesional con estrategias avanzadas, análisis técnico y gestión de riesgo.',
    'curso',
    497.00,
    'Cursos de Trading',
    40,
    'Avanzado',
    'Manuel Méndez',
    true,
    1
),
(
    'Consultoría Business Personalizada',
    'Sesión de consultoría 1:1 para optimizar tu negocio. Análisis completo y estrategia personalizada.',
    'servicio',
    297.00,
    'Consultoría Business',
    NULL,
    NULL,
    NULL,
    false,
    2
),
(
    'Pack Herramientas Automatización',
    'Suite completa de herramientas para automatizar tu negocio con templates y scripts listos.',
    'herramienta',
    197.00,
    'Herramientas Premium',
    NULL,
    NULL,
    NULL,
    false,
    3
)
ON CONFLICT DO NOTHING;

-- 5. ÍNDICES BÁSICOS
CREATE INDEX IF NOT EXISTS idx_ofertas_activo ON ofertas_marketplace(activo);
CREATE INDEX IF NOT EXISTS idx_ofertas_tipo ON ofertas_marketplace(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_ofertas_categoria ON ofertas_marketplace(categoria);

-- 6. RLS BÁSICO
ALTER TABLE ofertas_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ofertas públicas" ON ofertas_marketplace
    FOR SELECT USING (activo = true);

-- 7. VERIFICACIÓN FINAL
SELECT 
    '✅ SISTEMA OFERTAS MARKETPLACE LISTO' as resultado,
    COUNT(*) as total_ofertas,
    COUNT(CASE WHEN tipo_producto = 'curso' THEN 1 END) as cursos,
    COUNT(CASE WHEN tipo_producto = 'servicio' THEN 1 END) as servicios,
    COUNT(CASE WHEN tipo_producto = 'herramienta' THEN 1 END) as herramientas
FROM ofertas_marketplace;

-- Mostrar ofertas creadas
SELECT 
    titulo,
    tipo_producto,
    precio,
    categoria,
    activo
FROM ofertas_marketplace
ORDER BY orden, fecha_creacion; 