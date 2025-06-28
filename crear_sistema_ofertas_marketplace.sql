-- =====================================================
-- SISTEMA DE OFERTAS MARKETPLACE SCALEXONE
-- Replica la lógica de suscripciones para productos del marketplace
-- =====================================================

-- 1. TABLA DE OFERTAS MARKETPLACE
CREATE TABLE IF NOT EXISTS ofertas_marketplace (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_producto VARCHAR(50) NOT NULL CHECK (tipo_producto IN ('curso', 'servicio', 'producto_fisico', 'herramienta')),
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_original DECIMAL(10,2), -- Para mostrar descuentos
    moneda VARCHAR(3) DEFAULT 'USD',
    
    -- Información del producto
    imagen_url TEXT,
    proveedor VARCHAR(255) DEFAULT 'ScaleXone',
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    
    -- Métricas y rating
    rating DECIMAL(3,2) DEFAULT 4.8,
    reviews INTEGER DEFAULT 0,
    ventas_totales INTEGER DEFAULT 0,
    
    -- Características específicas por tipo
    caracteristicas JSONB DEFAULT '[]', -- Array de características
    especificaciones JSONB DEFAULT '{}', -- Specs técnicas
    
    -- Para cursos
    duracion_horas INTEGER,
    nivel VARCHAR(50), -- 'Principiante', 'Intermedio', 'Avanzado'
    instructor VARCHAR(255),
    certificado BOOLEAN DEFAULT false,
    
    -- Para servicios
    duracion_dias INTEGER, -- Duración del servicio
    incluye_soporte BOOLEAN DEFAULT true,
    tipo_entrega VARCHAR(50), -- 'digital', 'presencial', 'hibrido'
    
    -- Para productos físicos
    peso_kg DECIMAL(8,2),
    dimensiones JSONB, -- {"largo": 10, "ancho": 5, "alto": 2}
    stock_disponible INTEGER,
    requiere_envio BOOLEAN DEFAULT false,
    
    -- Sistema de afiliación
    afilible BOOLEAN DEFAULT true,
    niveles_comision INTEGER DEFAULT 3,
    comision_nivel1 DECIMAL(5,2) DEFAULT 25.00, -- Porcentaje nivel 1
    comision_nivel2 DECIMAL(5,2) DEFAULT 15.00, -- Porcentaje nivel 2  
    comision_nivel3 DECIMAL(5,2) DEFAULT 10.00, -- Porcentaje nivel 3
    
    -- Estado y ordenamiento
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    
    -- Configuración adicional
    configuracion JSONB DEFAULT '{}', -- Configuraciones específicas
    metadata JSONB DEFAULT '{}', -- Datos adicionales
    
    -- Timestamps
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MIGRAR DATOS EXISTENTES DEL MARKETPLACE
-- =====================================================

-- Migrar cursos desde cursos_marketplace
INSERT INTO ofertas_marketplace (
    titulo, descripcion, tipo_producto, precio, imagen_url, proveedor, categoria,
    rating, reviews, duracion_horas, nivel, instructor, certificado,
    afilible, niveles_comision, comision_nivel1, comision_nivel2, comision_nivel3,
    activo, orden, fecha_creacion
)
SELECT 
    titulo,
    descripcion,
    'curso' as tipo_producto,
    precio,
    imagen_url,
    instructor as proveedor,
    categoria,
    rating,
    estudiantes as reviews,
    duracion_horas,
    nivel,
    instructor,
    true as certificado,
    COALESCE(afilible, true) as afilible,
    COALESCE(niveles_comision, 3) as niveles_comision,
    COALESCE(comision_nivel1, 25) as comision_nivel1,
    COALESCE(comision_nivel2, 15) as comision_nivel2,
    COALESCE(comision_nivel3, 10) as comision_nivel3,
    activo,
    orden,
    created_at as fecha_creacion
FROM cursos_marketplace
WHERE activo = true
ON CONFLICT DO NOTHING;

-- Migrar servicios desde servicios_marketplace (excluyendo suscripciones)
INSERT INTO ofertas_marketplace (
    titulo, descripcion, tipo_producto, precio, imagen_url, proveedor, categoria,
    rating, reviews, duracion_dias, incluye_soporte, tipo_entrega,
    afilible, niveles_comision, comision_nivel1, comision_nivel2, comision_nivel3,
    activo, orden, fecha_creacion
)
SELECT 
    titulo,
    descripcion,
    CASE 
        WHEN tipo_producto = 'servicio' THEN 'servicio'
        WHEN tipo_producto = 'herramienta' THEN 'herramienta'
        ELSE 'servicio'
    END as tipo_producto,
    precio,
    imagen_url,
    proveedor,
    categoria,
    rating,
    reviews,
    duracion_dias,
    true as incluye_soporte,
    'digital' as tipo_entrega,
    COALESCE(afilible, true) as afilible,
    COALESCE(niveles_comision, 3) as niveles_comision,
    COALESCE(comision_nivel1, 20) as comision_nivel1,
    COALESCE(comision_nivel2, 15) as comision_nivel2,
    COALESCE(comision_nivel3, 10) as comision_nivel3,
    activo,
    0 as orden,
    created_at as fecha_creacion
FROM servicios_marketplace
WHERE activo = true 
  AND (tipo_producto != 'suscripcion' OR tipo_producto IS NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT 
    '🎉 SISTEMA DE OFERTAS MARKETPLACE CREADO EXITOSAMENTE' as resultado,
    COUNT(*) as total_ofertas,
    COUNT(CASE WHEN tipo_producto = 'curso' THEN 1 END) as cursos,
    COUNT(CASE WHEN tipo_producto = 'servicio' THEN 1 END) as servicios,
    COUNT(CASE WHEN tipo_producto = 'herramienta' THEN 1 END) as herramientas
FROM ofertas_marketplace;

SELECT 
    '✅ MIGRACIÓN COMPLETADA - SISTEMA DUAL LISTO' as estado_final;
