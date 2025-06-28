-- Script para verificar integración cursos marketplace → planes suscripción
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar cursos de tipo suscripción creados
SELECT 
    '🎓 CURSOS TIPO SUSCRIPCIÓN' as titulo,
    id,
    titulo,
    tipo_producto,
    plan_suscripcion_id,
    precio,
    duracion_dias,
    created_at
FROM cursos_marketplace 
WHERE tipo_producto = 'suscripcion'
ORDER BY created_at DESC;

-- 2. Verificar planes de suscripción con configuración de curso
SELECT 
    '📋 PLANES DE CURSO EN SUSCRIPCIONES' as titulo,
    id,
    nombre,
    descripcion,
    precio,
    duracion_dias,
    configuracion,
    comunidad_id,
    activo,
    fecha_creacion
FROM planes_suscripcion 
WHERE configuracion->>tipo = 'curso_suscripcion'
   OR nombre LIKE 'Plan: %'
ORDER BY fecha_creacion DESC;

-- 3. Verificar todos los planes de la comunidad ScaleXone
SELECT 
    '�� TODOS LOS PLANES SCALEXONE' as titulo,
    id,
    nombre,
    precio,
    duracion_dias,
    activo,
    comunidad_id
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
ORDER BY fecha_creacion DESC;

-- 4. Verificar conexión entre cursos y planes
SELECT 
    '🔗 CONEXIÓN CURSOS-PLANES' as titulo,
    c.titulo as curso_titulo,
    c.tipo_producto,
    c.plan_suscripcion_id,
    p.nombre as plan_nombre,
    p.precio as plan_precio,
    p.activo as plan_activo
FROM cursos_marketplace c
LEFT JOIN planes_suscripcion p ON c.plan_suscripcion_id = p.id
WHERE c.tipo_producto = 'suscripcion';

-- 5. Contar registros por tipo
SELECT 
    '📊 RESUMEN CONTADORES' as titulo,
    (SELECT COUNT(*) FROM cursos_marketplace WHERE tipo_producto = 'suscripcion') as cursos_suscripcion,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE configuracion->>tipo = 'curso_suscripcion') as planes_curso,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as total_planes_scalexone;
