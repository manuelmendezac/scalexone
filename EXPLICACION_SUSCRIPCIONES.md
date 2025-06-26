# 📋 SISTEMA DE SUSCRIPCIONES CON MARCA BLANCA - EXPLICACIÓN COMPLETA

## 🎯 **FUNCIONAMIENTO GENERAL**

El sistema está diseñado para que **cada administrador de marca blanca pueda gestionar sus propias suscripciones de forma independiente**, manteniendo la seguridad y aislamiento de datos entre organizaciones.

---

## 🏗️ **ARQUITECTURA DE BASE DE DATOS**

### **1. TABLA `organizaciones`** 
**Propósito**: Representa cada marca blanca independiente

```sql
organizaciones (
    id UUID PRIMARY KEY,
    nombre VARCHAR(255),           -- Nombre de la marca blanca
    slug VARCHAR(100) UNIQUE,      -- Identificador único (ej: "scalexone", "democorp")
    descripcion TEXT,
    logo_url TEXT,
    dominio_personalizado VARCHAR(255),  -- Dominio opcional (ej: "clientes.miempresa.com")
    configuracion JSONB,           -- Configuraciones específicas
    estado VARCHAR(20)             -- 'activa', 'suspendida', 'cancelada'
)
```

**Ejemplo de datos**:
```
| id | nombre | slug | dominio_personalizado |
|----|--------|------|----------------------|
| 1  | ScaleXOne | scalexone | app.scalexone.com |
| 2  | MiEmpresa Corp | miempresa | subs.miempresa.com |
```

### **2. TABLA `planes_suscripcion`**
**Propósito**: Cada organización define sus propios planes

```sql
planes_suscripcion (
    id UUID PRIMARY KEY,
    organizacion_id UUID,          -- Vincula el plan a una organización específica
    nombre VARCHAR(255),           -- "Basic", "Pro", "Premium"
    precio DECIMAL(10,2),
    duracion_dias INTEGER,         -- 30, 90, 365, etc.
    caracteristicas JSONB,         -- ["Feature 1", "Feature 2"]
    limites JSONB,                 -- {"usuarios": 5, "storage_gb": 100}
    activo BOOLEAN
)
```

### **3. TABLA `suscripciones`**
**Propósito**: Registra las suscripciones activas de usuarios

```sql
suscripciones (
    id UUID PRIMARY KEY,
    usuario_id UUID,               -- Usuario suscrito
    organizacion_id UUID,          -- A qué organización pertenece
    plan_id UUID,                  -- Qué plan tiene contratado
    estado VARCHAR(20),            -- 'activa', 'cancelada', 'pausada', 'vencida', 'trial'
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    renovacion_automatica BOOLEAN,
    precio_pagado DECIMAL(10,2)    -- Precio real pagado (puede tener descuentos)
)
```

### **4. TABLA `transacciones_suscripcion`**
**Propósito**: Historial de pagos y transacciones

```sql
transacciones_suscripcion (
    id UUID PRIMARY KEY,
    suscripcion_id UUID,
    organizacion_id UUID,          -- Para filtrar por organización
    monto DECIMAL(10,2),
    estado VARCHAR(20),            -- 'pendiente', 'completada', 'fallida'
    metodo_pago VARCHAR(50),       -- 'stripe', 'paypal', 'transferencia'
    referencia_externa VARCHAR(255) -- ID de la transacción en el proveedor
)
```

---

## 🔐 **SEGURIDAD CON ROW LEVEL SECURITY (RLS)**

### **Políticas de Acceso**:

1. **Administradores de organización** solo ven datos de SU organización
2. **Superadministradores** pueden ver todas las organizaciones
3. **Usuarios regulares** solo ven sus propias suscripciones

```sql
-- Ejemplo de política para suscripciones
CREATE POLICY "Ver suscripciones" ON suscripciones
    FOR SELECT USING (
        auth.jwt() ->> 'rol' = 'superadmin' OR
        auth.jwt() ->> 'organizacion_id' = organizacion_id::text OR
        auth.jwt() ->> 'user_id' = usuario_id::text
    );
```

---

## 🚀 **FLUJO DE FUNCIONAMIENTO**

### **PASO 1: Configuración de Organización**
```typescript
// 1. Crear organización
const organizacion = await SuscripcionesAPI.organizaciones.crearOrganizacion({
    nombre: "Mi Empresa Corp",
    slug: "miempresa",
    dominio_personalizado: "subs.miempresa.com"
});
```

### **PASO 2: Crear Planes**
```typescript
// 2. Admin de organización crea sus planes
const planBasic = await SuscripcionesAPI.planes.crearPlan({
    organizacion_id: organizacion.id,
    nombre: "Basic",
    precio: 19.99,
    duracion_dias: 30,
    caracteristicas: ["Feature A", "Feature B"],
    limites: { usuarios: 1, storage_gb: 5 }
});
```

### **PASO 3: Usuario Se Suscribe**
```typescript
// 3. Cuando un usuario se suscribe
const suscripcion = await SuscripcionesAPI.suscripciones.crearSuscripcion({
    usuario_id: "user-123",
    organizacion_id: organizacion.id,
    plan_id: planBasic.id,
    fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    precio_pagado: 19.99
});
```

### **PASO 4: Procesar Pago**
```typescript
// 4. Registrar transacción
const transaccion = await SuscripcionesAPI.transacciones.crearTransaccion({
    suscripcion_id: suscripcion.id,
    organizacion_id: organizacion.id,
    usuario_id: "user-123",
    monto: 19.99,
    metodo_pago: "stripe",
    estado: "completada"
});
```

---

## 📊 **GESTIÓN DESDE EL ADMIN PANEL**

### **Lo que puede hacer cada Admin de Organización**:

✅ **Ver solo SUS suscripciones**
✅ **Gestionar solo SUS planes**
✅ **Ver estadísticas de SU organización**
✅ **Cancelar/pausar suscripciones de sus usuarios**
✅ **Crear códigos de descuento**
✅ **Ver transacciones de su organización**

### **Lo que NO puede hacer**:
❌ Ver datos de otras organizaciones
❌ Modificar suscripciones de otros admins
❌ Acceder a transacciones de otras empresas

---

## 🔄 **OPERACIONES COMUNES**

### **1. Obtener Suscripciones de Mi Organización**
```typescript
const suscripciones = await SuscripcionesAPI.suscripciones
    .obtenerSuscripcionesPorOrganizacion('mi-organizacion-id', {
        estado: 'activa',
        busqueda: 'usuario@email.com'
    });
```

### **2. Cancelar Suscripción**
```typescript
await SuscripcionesAPI.suscripciones.cancelarSuscripcion(
    'suscripcion-id',
    'Cancelada por administrador'
);
```

### **3. Obtener Estadísticas**
```typescript
const stats = await SuscripcionesAPI.estadisticas
    .obtenerEstadisticasOrganizacion('mi-organizacion-id');

// Devuelve: { total_suscripciones, suscripciones_activas, ingresos_mensuales, tasa_retencion }
```

---

## 🛠️ **INTEGRACIÓN EN TU FRONTEND**

### **En el componente `SuscripcionesAdminPanel`**:

1. **Se conecta automáticamente** a la organización del usuario logueado
2. **Carga datos en paralelo** (suscripciones, planes, estadísticas)
3. **Permite acciones en tiempo real** (pausar, cancelar, reanudar)
4. **Actualiza automáticamente** después de cada acción

```typescript
// El componente detecta automáticamente la organización del usuario
const organizacionId = userInfo?.community_id || 'scalexone-default';

// Carga todos los datos necesarios
const [suscripcionesData, planesData, estadisticasData] = await Promise.all([
    SuscripcionesAPI.suscripciones.obtenerSuscripcionesPorOrganizacion(organizacionId),
    SuscripcionesAPI.planes.obtenerPlanesPorOrganizacion(organizacionId),
    SuscripcionesAPI.estadisticas.obtenerEstadisticasOrganizacion(organizacionId)
]);
```

---

## ⚡ **PRÓXIMOS PASOS PARA IMPLEMENTAR**

### **PASO 1: Ejecutar SQL** ✅
```bash
# En tu panel de Supabase, ejecuta:
cat crear_sistema_suscripciones.sql
```

### **PASO 2: Actualizar tabla usuarios** 
```sql
-- Agregar organizacion_id a tabla usuarios existente
ALTER TABLE usuarios ADD COLUMN organizacion_id UUID REFERENCES organizaciones(id);

-- Actualizar usuarios existentes con organización por defecto
UPDATE usuarios SET organizacion_id = (
    SELECT id FROM organizaciones WHERE slug = 'scalexone' LIMIT 1
) WHERE organizacion_id IS NULL;
```

### **PASO 3: Configurar JWT Claims**
En Supabase, necesitas que el JWT incluya `organizacion_id`:

```sql
-- Función para incluir organizacion_id en JWT
CREATE OR REPLACE FUNCTION auth.jwt_custom_claims(user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'organizacion_id', u.organizacion_id::text,
    'rol', u.rol
  )
  FROM usuarios u
  WHERE u.id = user_id;
$$;
```

### **PASO 4: Testear Funcionalidad**
1. Crear organización de prueba
2. Crear planes
3. Crear suscripciones de prueba
4. Verificar que el admin panel muestre los datos

---

## 🎯 **BENEFICIOS DE ESTA ARQUITECTURA**

✅ **Escalabilidad**: Cada organización crece independientemente
✅ **Seguridad**: Aislamiento total de datos
✅ **Flexibilidad**: Cada admin define sus propios planes y precios
✅ **Auditoría**: Historial completo de cambios y transacciones
✅ **Multi-tenancy**: Una sola base de datos, múltiples clientes
✅ **Performance**: Índices optimizados para consultas por organización

---

## 🔧 **MANTENIMIENTO**

### **Verificar suscripciones vencidas** (ejecutar diariamente):
```sql
SELECT verificar_suscripciones_vencidas();
```

### **Limpiar datos antiguos** (opcional):
```sql
-- Eliminar transacciones fallidas de más de 90 días
DELETE FROM transacciones_suscripcion 
WHERE estado = 'fallida' 
AND fecha_creacion < NOW() - INTERVAL '90 days';
```

¡Con esta arquitectura tienes un sistema completo y profesional de suscripciones con marca blanca! 🚀 