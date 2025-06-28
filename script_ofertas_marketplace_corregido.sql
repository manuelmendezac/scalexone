-- =====================================================
-- 🛒 SISTEMA DE OFERTAS MARKETPLACE SCALEXONE - CORREGIDO
-- =====================================================
-- Script que respeta las columnas reales de las tablas existentes

-- 1. VERIFICAR COLUMNAS REALES DE LAS TABLAS EXISTENTES
SELECT 
    '🔍 VERIFICANDO SERVICIOS_MARKETPLACE' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    '🔍 VERIFICANDO CURSOS_MARKETPLACE' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'cursos_marketplace' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    '🔍 VERIFICANDO CURSOS (SI EXISTE)' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'cursos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. TABLA PRINCIPAL DE OFERTAS MARKETPLACE
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

-- 3. MIGRACIÓN SEGURA DESDE SERVICIOS_MARKETPLACE
-- Solo migrar columnas que existen en servicios_marketplace
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
    caracteristicas,
    afilible, 
    comision_nivel1, 
    comision_nivel2, 
    comision_nivel3,
    activo, 
    fecha_creacion, 
    fecha_actualizacion
)
SELECT 
    titulo,
    descripcion,
    'servicio' as tipo_producto,
    precio,
    imagen_url,
    proveedor,
    categoria,
    COALESCE(rating, 4.8) as rating,
    COALESCE(reviews, 0) as reviews,
    COALESCE(caracteristicas, '[]'::jsonb) as caracteristicas,
    COALESCE(afilible, true) as afilible,
    COALESCE(comision_nivel1, 20.0) as comision_nivel1,
    COALESCE(comision_nivel2, 12.0) as comision_nivel2,
    COALESCE(comision_nivel3, 8.0) as comision_nivel3,
    COALESCE(activo, true) as activo,
    COALESCE(created_at, CURRENT_TIMESTAMP) as fecha_creacion,
    COALESCE(updated_at, CURRENT_TIMESTAMP) as fecha_actualizacion
FROM servicios_marketplace 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'servicios_marketplace')
    AND COALESCE(activo, true) = true
ON CONFLICT DO NOTHING;

-- 4. MIGRACIÓN SEGURA DESDE CURSOS_MARKETPLACE (SI EXISTE)
-- Verificar si la tabla cursos_marketplace existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cursos_marketplace') THEN
        -- Si existe cursos_marketplace, migrar desde ahí
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
            caracteristicas,
            duracion_horas,
            nivel,
            instructor,
            certificado,
            afilible, 
            comision_nivel1, 
            comision_nivel2, 
            comision_nivel3,
            activo, 
            fecha_creacion, 
            fecha_actualizacion
        )
        SELECT 
            titulo,
            descripcion,
            'curso' as tipo_producto,
            precio,
            imagen_url,
            COALESCE(instructor, 'ScaleXone') as proveedor,
            COALESCE(categoria, 'Cursos de Trading') as categoria,
            COALESCE(rating, 4.8) as rating,
            COALESCE(reviews, 0) as reviews,
            COALESCE(caracteristicas, '[]'::jsonb) as caracteristicas,
            COALESCE(duracion_horas, 0) as duracion_horas,
            COALESCE(nivel, 'Principiante') as nivel,
            COALESCE(instructor, 'ScaleXone') as instructor,
            COALESCE(certificado, true) as certificado,
            COALESCE(afilible, true) as afilible,
            COALESCE(comision_nivel1, 25.0) as comision_nivel1,
            COALESCE(comision_nivel2, 15.0) as comision_nivel2,
            COALESCE(comision_nivel3, 10.0) as comision_nivel3,
            COALESCE(activo, true) as activo,
            COALESCE(created_at, CURRENT_TIMESTAMP) as fecha_creacion,
            COALESCE(updated_at, CURRENT_TIMESTAMP) as fecha_actualizacion
        FROM cursos_marketplace 
        WHERE COALESCE(activo, true) = true
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Migrados cursos desde cursos_marketplace';
    ELSE
        RAISE NOTICE '⚠️  Tabla cursos_marketplace no existe, intentando migrar desde cursos';
    END IF;
END $$;

-- 5. MIGRACIÓN ALTERNATIVA DESDE TABLA CURSOS (SI NO EXISTE cursos_marketplace)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cursos_marketplace') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cursos') THEN
        -- Si solo existe la tabla cursos, migrar desde ahí
        INSERT INTO ofertas_marketplace (
            titulo, 
            descripcion, 
            tipo_producto, 
            precio, 
            imagen_url, 
            proveedor, 
            categoria,
            rating,
            caracteristicas,
            duracion_horas,
            nivel,
            instructor,
            certificado,
            afilible, 
            comision_nivel1, 
            comision_nivel2, 
            comision_nivel3,
            activo, 
            fecha_creacion, 
            fecha_actualizacion
        )
        SELECT 
            titulo,
            descripcion,
            'curso' as tipo_producto,
            COALESCE(precio, 0) as precio,
            imagen_url,
            COALESCE(instructor, 'ScaleXone') as proveedor,
            'Cursos de Trading' as categoria,
            4.8 as rating,
            '[]'::jsonb as caracteristicas,
            COALESCE(duracion_horas, 0) as duracion_horas,
            COALESCE(nivel, 'Principiante') as nivel,
            COALESCE(instructor, 'ScaleXone') as instructor,
            true as certificado,
            true as afilible,
            25.0 as comision_nivel1,
            15.0 as comision_nivel2,
            10.0 as comision_nivel3,
            COALESCE(activo, true) as activo,
            COALESCE(created_at, CURRENT_TIMESTAMP) as fecha_creacion,
            COALESCE(updated_at, CURRENT_TIMESTAMP) as fecha_actualizacion
        FROM cursos 
        WHERE COALESCE(activo, true) = true
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Migrados cursos desde tabla cursos';
    END IF;
END $$;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

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
-- DATOS DE EJEMPLO GARANTIZADOS
-- =====================================================

-- Insertar ofertas de ejemplo siempre (independiente de la migración)
INSERT INTO ofertas_marketplace (
    titulo, descripcion, tipo_producto, precio, categoria, 
    duracion_horas, nivel, instructor, caracteristicas, destacado, orden
) VALUES 
(
    'Masterclass Trading Avanzado 2024',
    'Curso completo de trading profesional con estrategias avanzadas, análisis técnico y gestión de riesgo. Incluye 3 meses de mentoría personalizada.',
    'curso',
    497.00,
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
    'Herramientas Premium',
    NULL,
    NULL,
    NULL,
    '["50+ templates listos", "Scripts de automatización", "Configuraciones pre-hechas", "Documentación completa", "Soporte 30 días"]'::jsonb,
    false,
    3
),
(
    'Consultoría Estratégica ScaleXone',
    'Sesión personalizada de estrategia empresarial con expertos en escalabilidad y crecimiento de negocios digitales.',
    'servicio',
    150.00,
    'Consultoría',
    NULL,
    NULL,
    NULL,
    '["Sesión 1:1", "Análisis completo", "Plan estratégico", "Seguimiento"]'::jsonb,
    false,
    4
),
(
    'Curso Marketing Digital Completo',
    'Estrategias completas de marketing digital: SEO, SEM, redes sociales, email marketing y automatización.',
    'curso',
    249.99,
    'Marketing Digital',
    30,
    'Intermedio',
    'Digital Masters',
    '["30 horas de contenido", "SEO avanzado", "SEM profesional", "Email marketing", "Automatización"]'::jsonb,
    true,
    5
),
(
    'Herramientas AI para Negocios',
    'Suite de herramientas de inteligencia artificial para automatizar y optimizar procesos empresariales.',
    'herramienta',
    399.99,
    'Inteligencia Artificial',
    NULL,
    NULL,
    NULL,
    '["10+ herramientas IA", "Automatización completa", "Integración simple", "Soporte técnico", "Actualizaciones"]'::jsonb,
    true,
    6
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN DE RESULTADOS
-- =====================================================

-- Mostrar resumen de migración
SELECT 
    '🛒 TABLA OFERTAS MARKETPLACE CREADA' as resultado,
    COUNT(*) as total_ofertas,
    COUNT(CASE WHEN tipo_producto = 'curso' THEN 1 END) as cursos,
    COUNT(CASE WHEN tipo_producto = 'servicio' THEN 1 END) as servicios,
    COUNT(CASE WHEN tipo_producto = 'herramienta' THEN 1 END) as herramientas
FROM ofertas_marketplace;

-- Mostrar ofertas por categoría
SELECT 
    '📊 OFERTAS POR CATEGORÍA' as info,
    categoria,
    COUNT(*) as cantidad,
    AVG(precio) as precio_promedio
FROM ofertas_marketplace
GROUP BY categoria
ORDER BY cantidad DESC;

-- Verificación final
SELECT 
    '✅ SISTEMA LISTO PARA USO' as estado,
    'Panel Admin → Contenido → Ofertas ScaleXone' as acceso;

-- Mostrar algunas ofertas de ejemplo
SELECT 
    '🎯 OFERTAS DISPONIBLES' as info,
    titulo,
    tipo_producto,
    precio,
    categoria,
    activo
FROM ofertas_marketplace
ORDER BY orden, fecha_creacion
LIMIT 10; 