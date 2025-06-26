# Migración del Componente SuscripcionesAdminPanel a Comunidades

## Pasos de Migración

### 1. Ejecutar el SQL de unificación
Primero ejecuta el script `unificar_comunidades_organizaciones.sql` en Supabase.

### 2. Cambios principales en el componente

#### A. Importaciones
```typescript
// Cambiar
import { SuscripcionesAPI, type SuscripcionConDetalles, type PlanSuscripcion, type EstadisticasOrganizacion } from '../../services/suscripcionesService';

// Por
import { SuscripcionesAPI, type SuscripcionConDetalles, type PlanSuscripcion, type EstadisticasComunidad } from '../../services/suscripcionesService';
```

#### B. Estados
```typescript
// Cambiar todas las referencias de organizacion por comunidad
const [estadisticas, setEstadisticas] = useState<EstadisticasComunidad | null>(null);
const [comunidadId, setComunidadId] = useState<string | null>(null);
```

#### C. Función de inicialización
```typescript
const inicializarComunidad = async () => {
  if (intentosInicializacion >= 3) {
    console.error('Máximo número de intentos de inicialización alcanzado');
    setMensaje('Error: No se pudo inicializar la comunidad después de varios intentos');
    setLoading(false);
    return;
  }

  setIntentosInicializacion(prev => prev + 1);

  try {
    const communityId = userInfo?.community_id || 'default';
    console.log(`Inicializando comunidad (intento ${intentosInicializacion + 1}) para community_id:`, communityId);
    
    // Usar la nueva función para obtener/crear comunidad
    const comunidad = await SuscripcionesAPI.inicializarComunidadPorCommunityId(communityId);
    
    console.log('Comunidad obtenida/creada exitosamente:', comunidad);
    setComunidadId(comunidad.id);
  } catch (error) {
    console.error('Error completo inicializando comunidad:', error);
    setMensaje('Error al inicializar comunidad: ' + (error as Error).message);
    setLoading(false);
  }
};
```

#### D. useEffect actualizados
```typescript
useEffect(() => {
  if (userInfo?.community_id && !comunidadId) {
    inicializarComunidad();
  }
}, [userInfo?.community_id, comunidadId]);

useEffect(() => {
  if (comunidadId) {
    cargarDatos();
  }
}, [comunidadId]);
```

#### E. Función cargarDatos
```typescript
const cargarDatos = async () => {
  if (!comunidadId) {
    return;
  }

  try {
    setLoading(true);
    
    const [suscripcionesData, planesData, estadisticasData] = await Promise.all([
      SuscripcionesAPI.suscripciones.obtenerSuscripcionesPorComunidad(comunidadId),
      SuscripcionesAPI.planes.obtenerPlanesPorComunidad(comunidadId),
      SuscripcionesAPI.estadisticas.obtenerEstadisticasComunidad(comunidadId)
    ]);

    setSuscripciones(suscripcionesData);
    setPlanes(planesData);
    setEstadisticas(estadisticasData);
    
  } catch (error: any) {
    console.error('Error cargando datos:', error);
    setMensaje('Error al cargar los datos: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

#### F. Función handleCreateSuscripcion
```typescript
const handleCreateSuscripcion = async (suscripcionData: any) => {
  if (!comunidadId) {
    setMensaje('Error: Comunidad no inicializada');
    return;
  }

  try {
    setActionLoading('create');
    
    const plan = planes.find(p => p.id === suscripcionData.plan_id);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }
    
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + plan.duracion_dias);
    
    const nuevaSuscripcion = {
      ...suscripcionData,
      comunidad_id: comunidadId,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      precio_pagado: plan.precio,
      estado: suscripcionData.estado || 'activa'
    };
    
    await SuscripcionesAPI.suscripciones.crearSuscripcion(nuevaSuscripcion);
    setMensaje('Suscripción creada exitosamente');
    setShowCreateSuscripcion(false);
    await cargarDatos();
  } catch (error: any) {
    setMensaje('Error al crear suscripción: ' + error.message);
  } finally {
    setActionLoading(null);
  }
};
```

#### G. Función handleCreatePlan
```typescript
const handleCreatePlan = async (planData: any) => {
  if (!comunidadId) {
    setMensaje('Error: Comunidad no inicializada');
    return;
  }

  try {
    setActionLoading('create');
    const nuevoPlan = {
      ...planData,
      comunidad_id: comunidadId
    };
    
    await SuscripcionesAPI.planes.crearPlan(nuevoPlan);
    setMensaje('Plan creado exitosamente');
    setShowCreatePlan(false);
    await cargarDatos();
  } catch (error: any) {
    setMensaje('Error al crear plan: ' + error.message);
  } finally {
    setActionLoading(null);
  }
};
```

#### H. Actualizar referencias en el JSX
```typescript
// En la sección de estadísticas, cambiar todas las referencias:
// organizacion_nombre → comunidad_nombre
// total_suscripciones → total_suscriptores
// suscripciones_activas → suscriptores_activos
// ingresos_mensuales → ingresos_mes_actual
```

### 3. Verificación
Una vez hechos todos los cambios:

1. Verificar que no hay errores de TypeScript
2. Probar que la página carga correctamente
3. Verificar que se pueden crear planes y suscripciones
4. Confirmar que las estadísticas se muestran correctamente

### 4. Beneficios de la migración
- ✅ Usa la tabla `comunidades` existente en lugar de crear `organizaciones`
- ✅ Mantiene compatibilidad con el sistema actual de `community_id`
- ✅ Reutiliza la infraestructura de comunidades ya implementada
- ✅ Permite que ScaleXOne sea la primera comunidad del sistema
- ✅ Facilita la creación de marcas blancas usando la misma tabla

### 5. Estructura final
```
comunidades (tabla principal)
├── id (UUID)
├── nombre 
├── slug (para URLs amigables)
├── descripcion
├── logo_url
├── banner_url
├── dominio_personalizado (para marca blanca)
├── configuracion (JSONB para settings)
├── estado ('activa', 'suspendida', 'cancelada')
├── is_public
├── owner_id
└── fechas de creación/actualización

planes_suscripcion
├── comunidad_id → referencia a comunidades.id

suscripciones  
├── comunidad_id → referencia a comunidades.id

(etc. todas las tablas del sistema)
```

Esta migración unifica ambos sistemas y permite que cada comunidad maneje sus propias suscripciones de forma independiente. 