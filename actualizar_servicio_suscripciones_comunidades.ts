// Script para actualizar el servicio de suscripciones para usar comunidades
// Ejecutar este script después de aplicar el SQL de unificación

// 1. Renombrar interfaces y tipos
// - Organizacion → Comunidad
// - organizacion_id → comunidad_id
// - organizacion_nombre → comunidad_nombre

// 2. Actualizar servicios
// - OrganizacionService → ComunidadService
// - Cambiar todas las referencias de tabla "organizaciones" por "comunidades"

// 3. Actualizar funciones
// - obtenerOrganizaciones() → obtenerComunidades()
// - obtenerOrganizacionPorSlug() → obtenerComunidadPorSlug()
// - crearOrganizacion() → crearComunidad()
// - actualizarOrganizacion() → actualizarComunidad()

// 4. Cambios principales en el servicio:

export const CAMBIOS_NECESARIOS = {
  // TIPOS DE DATOS
  interfaces: {
    "Organizacion": "Comunidad",
    "EstadisticasOrganizacion": "EstadisticasComunidad"
  },
  
  // PROPIEDADES
  propiedades: {
    "organizacion_id": "comunidad_id",
    "organizacion_nombre": "comunidad_nombre",
    "organizacion_slug": "comunidad_slug"
  },
  
  // NOMBRES DE SERVICIOS
  servicios: {
    "OrganizacionService": "ComunidadService"
  },
  
  // NOMBRES DE TABLAS
  tablas: {
    "organizaciones": "comunidades"
  },
  
  // NOMBRES DE MÉTODOS
  metodos: {
    "obtenerOrganizaciones": "obtenerComunidades",
    "obtenerOrganizacionPorSlug": "obtenerComunidadPorSlug",
    "crearOrganizacion": "crearComunidad",
    "actualizarOrganizacion": "actualizarComunidad",
    "obtenerPlanesPorOrganizacion": "obtenerPlanesPorComunidad",
    "obtenerSuscripcionesPorOrganizacion": "obtenerSuscripcionesPorComunidad",
    "obtenerTransaccionesPorOrganizacion": "obtenerTransaccionesPorComunidad",
    "obtenerDescuentosPorOrganizacion": "obtenerDescuentosPorComunidad",
    "obtenerEstadisticasOrganizacion": "obtenerEstadisticasComunidad"
  }
};

// 5. Nueva función para compatibilidad con community_id
export const NUEVA_FUNCION_COMPATIBILIDAD = `
// Función especial para obtener comunidad por community_id (compatibilidad)
static async obtenerOCrearComunidadPorCommunityId(communityId: string): Promise<Comunidad> {
  // Primero intentar encontrar por slug
  let comunidad = await this.obtenerComunidadPorSlug(communityId);
  
  if (!comunidad) {
    // Buscar por nombre
    const { data } = await supabase
      .from('comunidades')
      .select('*')
      .ilike('nombre', \`%\${communityId}%\`)
      .limit(1)
      .single();
    
    comunidad = data;
  }

  // Si no existe, usar la función SQL para crear automáticamente
  if (!comunidad) {
    const { data, error } = await supabase
      .rpc('get_comunidad_by_community_id', { community_id_param: communityId });
    
    if (error) throw error;
    
    // Obtener la comunidad recién creada
    comunidad = await this.obtenerComunidadPorId(data);
  }

  if (!comunidad) {
    throw new Error(\`No se pudo obtener o crear la comunidad para community_id: \${communityId}\`);
  }

  return comunidad;
}
`;

console.log('Cambios necesarios para actualizar el servicio:', CAMBIOS_NECESARIOS);
console.log('Nueva función de compatibilidad:', NUEVA_FUNCION_COMPATIBILIDAD); 