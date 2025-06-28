-- =====================================================
-- SCRIPT: IMPLEMENTAR PAGO ÚNICO PARA SERVICIOS
-- Fecha: $(date)
-- Descripción: Agrega soporte de pago único a servicios_marketplace
-- =====================================================

-- ✅ PASO 1: Agregar campo tipo_pago a servicios_marketplace
ALTER TABLE servicios_marketplace 
ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR(20) DEFAULT 'pago_unico' 
CHECK (tipo_pago IN ('suscripcion', 'pago_unico'));

-- ✅ PASO 2: Agregar comentario explicativo
COMMENT ON COLUMN servicios_marketplace.tipo_pago IS 'Tipo de pago: suscripcion (recurrente) o pago_unico (una sola vez)';

-- ✅ PASO 3: Actualizar servicios existentes (mantener compatibilidad)
-- Los servicios tradicionales serán 'pago_unico' por defecto
-- Los servicios con plan_suscripcion_id serán 'suscripcion'
UPDATE servicios_marketplace 
SET tipo_pago = CASE 
  WHEN plan_suscripcion_id IS NOT NULL THEN 'suscripcion'
  ELSE 'pago_unico'
END;

-- ✅ PASO 4: Crear índice para optimización
CREATE INDEX IF NOT EXISTS idx_servicios_tipo_pago ON servicios_marketplace(tipo_pago);

-- ✅ PASO 5: Verificar cambios
SELECT 
  'Servicios Pago Único' as tipo,
  COUNT(*) as cantidad
FROM servicios_marketplace 
WHERE tipo_pago = 'pago_unico'

UNION ALL

SELECT 
  'Servicios Suscripción' as tipo,
  COUNT(*) as cantidad
FROM servicios_marketplace 
WHERE tipo_pago = 'suscripcion';

-- =====================================================
-- VERIFICACIÓN DETALLADA
-- =====================================================
SELECT 
  titulo,
  categoria,
  tipo_producto,
  tipo_pago,
  precio,
  CASE 
    WHEN plan_suscripcion_id IS NOT NULL THEN 'Con Plan Suscripción'
    ELSE 'Sin Plan Suscripción'
  END as estado_plan,
  CASE 
    WHEN tipo_pago = 'pago_unico' THEN CONCAT('$', precio, ' único')
    WHEN tipo_pago = 'suscripcion' AND duracion_dias = 30 THEN CONCAT('$', precio, '/mes')
    WHEN tipo_pago = 'suscripcion' AND duracion_dias = 365 THEN CONCAT('$', precio, '/año')
    ELSE CONCAT('$', precio, '/suscripción')
  END as precio_display
FROM servicios_marketplace 
ORDER BY created_at DESC;

-- =====================================================
-- OPCIONAL: CREAR SERVICIOS DE EJEMPLO
-- =====================================================

-- Servicio de Pago Único
INSERT INTO servicios_marketplace (
  id, titulo, descripcion, precio, proveedor, categoria, rating, reviews,
  activo, tipo_pago, imagen_url, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Auditoría SEO Completa',
  'Análisis exhaustivo del SEO de tu sitio web con reporte detallado y plan de optimización.',
  297,
  'SEO Masters',
  'Marketing',
  4.9,
  156,
  true,
  'pago_unico',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Servicio de Suscripción Mensual
INSERT INTO servicios_marketplace (
  id, titulo, descripcion, precio, proveedor, categoria, rating, reviews,
  activo, tipo_pago, duracion_dias, imagen_url, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Gestión de Redes Sociales Premium',
  'Gestión completa de todas tus redes sociales con contenido diario y reportes mensuales.',
  497,
  'Social Media Pro',
  'Marketing',
  4.8,
  89,
  true,
  'suscripcion',
  30,
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================
SELECT 
  '✅ IMPLEMENTACIÓN COMPLETA' as estado,
  'Pago único para servicios implementado exitosamente' as mensaje;

COMMENT ON TABLE servicios_marketplace IS 'Tabla servicios marketplace con soporte completo para pago único y suscripciones';

/*
🎯 DESPUÉS DE EJECUTAR ESTE SCRIPT:

1. ✅ VERIFICAR en el panel admin que aparece el selector "Tipo de Pago"
2. ✅ CREAR un servicio de pago único de prueba
3. ✅ VERIFICAR en el marketplace que muestra "$XXX único" y botón "Contratar"
4. ✅ CREAR un servicio de suscripción de prueba  
5. ✅ VERIFICAR en el marketplace que muestra "$XXX/mes" y botón "Suscribirse"

🚀 SISTEMA COMPLETAMENTE FUNCIONAL PARA PAGO ÚNICO Y SUSCRIPCIONES!
*/
