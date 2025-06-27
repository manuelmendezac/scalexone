-- Script para crear suscripción de ejemplo en el marketplace
-- Este script inserta una suscripción directamente en servicios_marketplace para demostrar la funcionalidad

-- Insertar suscripción Premium de ejemplo
INSERT INTO servicios_marketplace (
  id,
  titulo,
  descripcion,
  precio,
  imagen_url,
  proveedor,
  categoria,
  rating,
  reviews,
  activo,
  tipo_producto,
  duracion_dias,
  caracteristicas,
  -- Configuración de afiliación
  afilible,
  niveles_comision,
  comision_nivel1,
  comision_nivel2,
  comision_nivel3,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ScaleXone Premium',
  'Acceso completo a todos los cursos, herramientas de IA avanzadas, comunidad VIP y soporte prioritario. La membresía definitiva para escalar tu negocio.',
  97.00,
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&h=300&fit=crop',
  'ScaleXone',
  'Suscripción Premium',
  4.9,
  1247,
  true,
  'suscripcion',
  30, -- 30 días = mensual
  ARRAY[
    'Acceso a todos los cursos premium',
    'Herramientas de IA avanzadas',
    'Comunidad VIP exclusiva',
    'Soporte prioritario 24/7',
    'Webinars exclusivos mensuales',
    'Templates y recursos premium',
    'Análisis de rendimiento avanzado',
    'Certificaciones oficiales'
  ],
  -- Configuración de afiliación
  true, -- afilible
  3,    -- niveles_comision (3 niveles)
  30,   -- comision_nivel1 (30%)
  20,   -- comision_nivel2 (20%)
  10,   -- comision_nivel3 (10%)
  NOW(),
  NOW()
);

-- Insertar suscripción Anual de ejemplo
INSERT INTO servicios_marketplace (
  id,
  titulo,
  descripcion,
  precio,
  imagen_url,
  proveedor,
  categoria,
  rating,
  reviews,
  activo,
  tipo_producto,
  duracion_dias,
  caracteristicas,
  -- Configuración de afiliación
  afilible,
  niveles_comision,
  comision_nivel1,
  comision_nivel2,
  comision_nivel3,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ScaleXone Premium Anual',
  'Membresía anual con 2 meses gratis. Acceso completo a la plataforma con descuento especial y beneficios exclusivos para miembros anuales.',
  970.00, -- Precio anual (equivale a 10 meses)
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=300&fit=crop',
  'ScaleXone',
  'Suscripción Premium',
  5.0,
  892,
  true,
  'suscripcion',
  365, -- 365 días = anual
  ARRAY[
    'Todo lo incluido en Premium mensual',
    '2 meses completamente gratis',
    'Sesión de coaching 1-on-1 trimestral',
    'Acceso anticipado a nuevas funciones',
    'Descuentos exclusivos en eventos',
    'Kit de bienvenida físico',
    'Análisis personalizado de negocio',
    'Prioridad en soporte técnico'
  ],
  -- Configuración de afiliación
  true, -- afilible
  3,    -- niveles_comision (3 niveles)
  35,   -- comision_nivel1 (35% - más alta por ser anual)
  25,   -- comision_nivel2 (25%)
  15,   -- comision_nivel3 (15%)
  NOW(),
  NOW()
);

-- Verificar que se insertaron correctamente
SELECT 
  titulo,
  precio,
  tipo_producto,
  duracion_dias,
  afilible,
  comision_nivel1
FROM servicios_marketplace 
WHERE tipo_producto = 'suscripcion'
ORDER BY created_at DESC; 