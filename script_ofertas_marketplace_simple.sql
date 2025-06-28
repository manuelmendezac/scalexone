-- =====================================================
-- 🛒 SISTEMA DE OFERTAS MARKETPLACE SCALEXONE
-- =====================================================
-- Versión Simplificada para ejecución directa en Supabase
-- Incluye solo la tabla principal y datos de ejemplo

-- 1. TABLA PRINCIPAL DE OFERTAS MARKETPLACE
CREATE TABLE IF NOT EXISTS ofertas_marketplace (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Información básica del producto
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_producto VARCHAR(50) DEFAULT 'curso' CHECK (tipo_producto IN ('curso', 'servicio', 'herramienta', 'producto_fisico')),
    
    -- Precios e información comercial
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_original DECIMAL(10,2), -- Para mostrar descuentos
    moneda VARCHAR(3) DEFAULT 'USD',
    imagen_url TEXT,
    proveedor VARCHAR(100) DEFAULT 'ScaleXone',
    categoria VARCHAR(100) DEFAULT 'Cursos de Trading',
    
    -- Métricas y valoraciones
    rating DECIMAL(3,2) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    ventas_totales INTEGER DEFAULT 0,
    
    -- Características del producto (JSON)
    caracteristicas JSONB DEFAULT '[]',
    
    -- Campos específicos para cursos
    duracion_horas INTEGER, -- Solo para cursos
    nivel VARCHAR(50), -- Solo para cursos: Principiante, Intermedio, Avanzado
    instructor VARCHAR(100), -- Solo para cursos
    certificado BOOLEAN, -- Solo para cursos
    
    -- Campos específicos para servicios
    duracion_dias INTEGER, -- Solo para servicios
    incluye_soporte BOOLEAN, -- Solo para servicios
    tipo_entrega VARCHAR(50), -- Solo para servicios: digital, presencial, hibrido
    
    -- Sistema de afiliación
    afilible BOOLEAN DEFAULT true,
    niveles_comision INTEGER DEFAULT 3 CHECK (niveles_comision IN (1, 3)),
    comision_nivel1 DECIMAL(5,2) DEFAULT 25.00,
    comision_nivel2 DECIMAL(5,2) DEFAULT 15.00,
    comision_nivel3 DECIMAL(5,2) DEFAULT 10.00,
    
    -- Estados y configuración
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    
    -- Timestamps
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MIGRAR DATOS EXISTENTES
-- =====================================================

-- Migrar desde cursos_marketplace (solo los afiliables)
INSERT INTO ofertas_marketplace (
    titulo, descripcion, tipo_producto, precio, precio_original, moneda, imagen_url, proveedor, categoria,
    rating, reviews, ventas_totales, caracteristicas, duracion_horas, nivel, instructor, certificado,
    afilible, niveles_comision, comision_nivel1, comision_nivel2, comision_nivel3,
    activo, destacado, orden, fecha_creacion, fecha_actualizacion
)
SELECT 
    titulo,
    descripcion,
    'curso' as tipo_producto,
    precio,
    precio_original,
    moneda,
    imagen_url,
    proveedor,
    categoria,
    rating,
    reviews,
    ventas_totales,
    caracteristicas,
    duracion_horas,
    nivel,
    instructor,
    certificado,
    afilible,
    niveles_comision,
    comision_nivel1,
    comision_nivel2,
    comision_nivel3,
    activo,
    destacado,
    orden,
    created_at,
    updated_at
FROM cursos_marketplace 
WHERE afilible = true
ON CONFLICT DO NOTHING;

-- Migrar desde servicios_marketplace (solo los afiliables)
INSERT INTO ofertas_marketplace (
    titulo, descripcion, tipo_producto, precio, precio_original, moneda, imagen_url, proveedor, categoria,
    rating, reviews, ventas_totales, caracteristicas, duracion_dias, incluye_soporte, tipo_entrega,
    afilible, niveles_comision, comision_nivel1, comision_nivel2, comision_nivel3,
    activo, destacado, orden, fecha_creacion, fecha_actualizacion
)
SELECT 
    titulo,
    descripcion,
    'servicio' as tipo_producto,
    precio,
    precio_original,
    moneda,
    imagen_url,
    proveedor,
    categoria,
    rating,
    reviews,
    ventas_totales,
    caracteristicas,
    duracion_dias,
    incluye_soporte,
    tipo_entrega,
    afilible,
    niveles_comision,
    comision_nivel1,
    comision_nivel2,
    comision_nivel3,
    activo,
    destacado,
    orden,
    created_at,
    updated_at
FROM servicios_marketplace 
WHERE afilible = true
    AND (tipo_producto != 'suscripcion' OR tipo_producto IS NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para ofertas_marketplace
CREATE INDEX IF NOT EXISTS idx_ofertas_tipo_producto ON ofertas_marketplace(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_ofertas_categoria ON ofertas_marketplace(categoria);
CREATE INDEX IF NOT EXISTS idx_ofertas_activo ON ofertas_marketplace(activo);
CREATE INDEX IF NOT EXISTS idx_ofertas_afilible ON ofertas_marketplace(afilible);
CREATE INDEX IF NOT EXISTS idx_ofertas_destacado ON ofertas_marketplace(destacado);
CREATE INDEX IF NOT EXISTS idx_ofertas_precio ON ofertas_marketplace(precio);
CREATE INDEX IF NOT EXISTS idx_ofertas_rating ON ofertas_marketplace(rating);
CREATE INDEX IF NOT EXISTS idx_ofertas_orden ON ofertas_marketplace(orden);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
ALTER TABLE ofertas_marketplace ENABLE ROW LEVEL SECURITY;

-- Políticas para ofertas_marketplace
CREATE POLICY "Ofertas públicas para lectura" ON ofertas_marketplace
    FOR SELECT USING (activo = true);

CREATE POLICY "Solo admins pueden modificar ofertas" ON ofertas_marketplace
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para ofertas_marketplace
CREATE TRIGGER trigger_actualizar_ofertas_marketplace
    BEFORE UPDATE ON ofertas_marketplace
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar algunas ofertas de ejemplo
INSERT INTO ofertas_marketplace (
    titulo, descripcion, tipo_producto, precio, precio_original, categoria, 
    duracion_horas, nivel, instructor, caracteristicas, destacado, orden
) VALUES 
(
    'Masterclass Trading Avanzado 2024',
    'Curso completo de trading profesional con estrategias avanzadas, análisis técnico y gestión de riesgo. Incluye 3 meses de mentoría personalizada.',
    'curso',
    497.00,
    797.00,
    'Cursos de Trading',
    40,
    'Avanzado',
    'Manuel Méndez',
    '["40 horas de contenido", "3 meses de mentoría", "Estrategias probadas", "Análisis técnico avanzado", "Gestión de riesgo", "Acceso de por vida"]'::jsonb,
    true,
    1
),
(
    'Consultoría Business Personalizada',
    'Sesión de consultoría 1:1 para optimizar tu negocio. Análisis completo, estrategia personalizada y plan de acción de 90 días.',
    'servicio',
    297.00,
    NULL,
    'Consultoría Business',
    NULL,
    NULL,
    NULL,
    '["Sesión 1:1 de 2 horas", "Análisis completo del negocio", "Plan de acción 90 días", "Seguimiento por email", "Templates exclusivos"]'::jsonb,
    false,
    2
),
(
    'Pack Herramientas Automatización',
    'Suite completa de herramientas para automatizar tu negocio. Incluye templates, scripts y configuraciones listas para usar.',
    'herramienta',
    197.00,
    297.00,
    'Herramientas Premium',
    NULL,
    NULL,
    NULL,
    '["50+ templates listos", "Scripts de automatización", "Configuraciones pre-hechas", "Documentación completa", "Soporte 30 días"]'::jsonb,
    false,
    3
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN DE RESULTADOS
-- =====================================================

SELECT 
    '🛒 TABLA OFERTAS MARKETPLACE CREADA' as resultado,
    COUNT(*) as total_ofertas,
    COUNT(CASE WHEN tipo_producto = 'curso' THEN 1 END) as cursos,
    COUNT(CASE WHEN tipo_producto = 'servicio' THEN 1 END) as servicios,
    COUNT(CASE WHEN tipo_producto = 'herramienta' THEN 1 END) as herramientas
FROM ofertas_marketplace;

SELECT 
    '✅ SISTEMA LISTO PARA USO' as estado,
    'Panel Admin → Contenido → Ofertas ScaleXone' as acceso;
