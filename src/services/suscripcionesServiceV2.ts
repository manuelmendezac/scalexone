import { supabase } from '../supabase';

// =====================================================
// TIPOS DE DATOS ACTUALIZADOS
// =====================================================

export interface Comunidad {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  logo_url?: string;
  banner_url?: string;
  dominio_personalizado?: string;
  configuracion: Record<string, any>;
  estado: 'activa' | 'suspendida' | 'cancelada';
  fecha_creacion: string;
  fecha_actualizacion: string;
  is_public?: boolean;
  owner_id?: string;
}

export interface PlanSuscripcion {
  id: string;
  comunidad_id: string; // ← Cambiado de organizacion_id
  nombre: string;
  descripcion?: string;
  precio: number;
  moneda: string;
  duracion_dias: number;
  caracteristicas: string[];
  limites: Record<string, any>;
  configuracion: Record<string, any>;
  activo: boolean;
  orden: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Suscripcion {
  id: string;
  usuario_id: string;
  comunidad_id: string; // ← Cambiado de organizacion_id
  plan_id: string;
  estado: 'activa' | 'cancelada' | 'pausada' | 'vencida' | 'trial';
  fecha_inicio: string;
  fecha_fin: string;
  fecha_cancelacion?: string;
  razon_cancelacion?: string;
  renovacion_automatica: boolean;
  precio_pagado?: number;
  descuento_aplicado: number;
  metadata: Record<string, any>;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Campos de personalización
  titulo_personalizado?: string;
  descripcion?: string;
  imagen_url?: string;
}

export interface SuscripcionConDetalles extends Suscripcion {
  usuario_nombre: string;
  usuario_email: string;
  plan_nombre: string;
  plan_precio: number;
  comunidad_nombre: string; // ← Cambiado de organizacion_nombre
  comunidad_slug: string;
}

export interface TransaccionSuscripcion {
  id: string;
  suscripcion_id: string;
  comunidad_id: string; // ← Cambiado de organizacion_id
  usuario_id: string;
  monto: number;
  moneda: string;
  estado: 'pendiente' | 'completada' | 'fallida' | 'reembolsada';
  metodo_pago: string;
  referencia_externa?: string;
  datos_pago: Record<string, any>;
  fecha_procesamiento?: string;
  fecha_creacion: string;
}

export interface CodigoDescuento {
  id: string;
  comunidad_id: string; // ← Cambiado de organizacion_id
  codigo: string;
  descripcion?: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
  fecha_inicio: string;
  fecha_fin?: string;
  usos_maximos?: number;
  usos_actuales: number;
  activo: boolean;
  planes_aplicables?: string[];
  metadata: Record<string, any>;
  fecha_creacion: string;
}

export interface EstadisticasComunidad {
  comunidad_id: string;
  comunidad_nombre: string;
  comunidad_slug: string;
  total_suscriptores: number;
  suscriptores_activos: number;
  total_planes: number;
  ingresos_totales: number;
  ingresos_mes_actual: number;
}

// =====================================================
// SERVICIOS DE COMUNIDADES (EX-ORGANIZACIONES)
// =====================================================

export class ComunidadService {
  static async obtenerComunidades(): Promise<Comunidad[]> {
    const { data, error } = await supabase
      .from('comunidades')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data || [];
  }

  static async obtenerComunidadPorSlug(slug: string): Promise<Comunidad | null> {
    const { data, error } = await supabase
      .from('comunidades')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async obtenerComunidadPorId(id: string): Promise<Comunidad | null> {
    const { data, error } = await supabase
      .from('comunidades')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async crearComunidad(comunidad: Partial<Comunidad>): Promise<Comunidad> {
    const { data, error } = await supabase
      .from('comunidades')
      .insert(comunidad)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarComunidad(id: string, updates: Partial<Comunidad>): Promise<Comunidad> {
    const { data, error } = await supabase
      .from('comunidades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Función especial para obtener comunidad por community_id (compatibilidad)
  static async obtenerOCrearComunidadPorCommunityId(communityId: string): Promise<Comunidad> {
    // Primero intentar encontrar por slug
    let comunidad = await this.obtenerComunidadPorSlug(communityId);
    
    if (!comunidad) {
      // Buscar por nombre
      const { data } = await supabase
        .from('comunidades')
        .select('*')
        .ilike('nombre', `%${communityId}%`)
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
      throw new Error(`No se pudo obtener o crear la comunidad para community_id: ${communityId}`);
    }

    return comunidad;
  }
}

// =====================================================
// SERVICIOS DE PLANES (ACTUALIZADO)
// =====================================================

export class PlanesService {
  static async obtenerPlanesPorComunidad(comunidadId: string): Promise<PlanSuscripcion[]> {
    const { data, error } = await supabase
      .from('planes_suscripcion')
      .select('*')
      .eq('comunidad_id', comunidadId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async obtenerPlanesActivos(comunidadId: string): Promise<PlanSuscripcion[]> {
    const { data, error } = await supabase
      .from('planes_suscripcion')
      .select('*')
      .eq('comunidad_id', comunidadId)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async crearPlan(plan: Partial<PlanSuscripcion>): Promise<PlanSuscripcion> {
    const { data, error } = await supabase
      .from('planes_suscripcion')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarPlan(id: string, updates: Partial<PlanSuscripcion>): Promise<PlanSuscripcion> {
    const { data, error } = await supabase
      .from('planes_suscripcion')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async eliminarPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('planes_suscripcion')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleActivoPlan(id: string): Promise<PlanSuscripcion> {
    // Primero obtener el estado actual
    const { data: planActual, error: errorGet } = await supabase
      .from('planes_suscripcion')
      .select('activo')
      .eq('id', id)
      .single();

    if (errorGet) throw errorGet;

    // Cambiar el estado
    const { data, error } = await supabase
      .from('planes_suscripcion')
      .update({ activo: !planActual.activo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// =====================================================
// SERVICIOS DE SUSCRIPCIONES (ACTUALIZADO)
// =====================================================

export class SuscripcionesService {
  static async obtenerSuscripcionesPorComunidad(
    comunidadId: string,
    filtros?: {
      estado?: string;
      busqueda?: string;
      planId?: string;
    }
  ): Promise<SuscripcionConDetalles[]> {
    let query = supabase
      .from('vista_suscripciones_activas')
      .select('*')
      .eq('comunidad_id', comunidadId);

    if (filtros?.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros?.planId) {
      query = query.eq('plan_id', filtros.planId);
    }

    if (filtros?.busqueda) {
      query = query.or(
        `usuario_nombre.ilike.%${filtros.busqueda}%,usuario_email.ilike.%${filtros.busqueda}%`
      );
    }

    const { data, error } = await query.order('fecha_inicio', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async obtenerSuscripcionPorId(id: string): Promise<SuscripcionConDetalles | null> {
    const { data, error } = await supabase
      .from('vista_suscripciones_activas')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async crearSuscripcion(suscripcion: Partial<Suscripcion>): Promise<Suscripcion> {
    const { data, error } = await supabase
      .from('suscripciones')
      .insert(suscripcion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarSuscripcion(id: string, updates: Partial<Suscripcion>): Promise<Suscripcion> {
    const { data, error } = await supabase
      .from('suscripciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async cancelarSuscripcion(id: string, razon?: string): Promise<Suscripcion> {
    const { data, error } = await supabase
      .from('suscripciones')
      .update({
        estado: 'cancelada',
        fecha_cancelacion: new Date().toISOString(),
        razon_cancelacion: razon,
        renovacion_automatica: false
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async pausarSuscripcion(id: string): Promise<Suscripcion> {
    return this.actualizarSuscripcion(id, { estado: 'pausada' });
  }

  static async reanudarSuscripcion(id: string): Promise<Suscripcion> {
    return this.actualizarSuscripcion(id, { estado: 'activa' });
  }

  static async cambiarPlan(suscripcionId: string, nuevoPlanId: string): Promise<Suscripcion> {
    const { data, error } = await supabase
      .from('suscripciones')
      .update({ plan_id: nuevoPlanId })
      .eq('id', suscripcionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async verificarSuscripcionesVencidas(): Promise<void> {
    const { error } = await supabase
      .from('suscripciones')
      .update({ estado: 'vencida' })
      .lt('fecha_fin', new Date().toISOString())
      .eq('estado', 'activa');

    if (error) throw error;
  }
}

// =====================================================
// SERVICIOS DE ESTADÍSTICAS (ACTUALIZADO)
// =====================================================

export class EstadisticasService {
  static async obtenerEstadisticasComunidad(comunidadId: string): Promise<EstadisticasComunidad | null> {
    const { data, error } = await supabase
      .from('vista_estadisticas_comunidad')
      .select('*')
      .eq('comunidad_id', comunidadId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async obtenerIngresosPorMes(comunidadId: string, meses: number = 12): Promise<any[]> {
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - meses);

    const { data, error } = await supabase
      .from('transacciones_suscripcion')
      .select('monto, fecha_procesamiento')
      .eq('comunidad_id', comunidadId)
      .eq('estado', 'completada')
      .gte('fecha_procesamiento', fechaInicio.toISOString())
      .order('fecha_procesamiento');

    if (error) throw error;

    // Agrupar por mes
    const ingresosPorMes: Record<string, number> = {};
    data?.forEach(transaccion => {
      if (transaccion.fecha_procesamiento) {
        const mes = new Date(transaccion.fecha_procesamiento).toISOString().slice(0, 7);
        ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + Number(transaccion.monto);
      }
    });

    // Convertir a array ordenado
    return Object.entries(ingresosPorMes)
      .map(([mes, ingresos]) => ({ mes, ingresos }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  static async obtenerSuscripcionesPorPlan(comunidadId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('suscripciones')
      .select(`
        plan_id,
        planes_suscripcion(nombre),
        estado
      `)
      .eq('comunidad_id', comunidadId);

    if (error) throw error;

    // Agrupar por plan y estado
    const resultado: Record<string, { plan_nombre: string; activas: number; total: number }> = {};
    
    data?.forEach(suscripcion => {
      const planId = suscripcion.plan_id;
      const planNombre = (suscripcion.planes_suscripcion as any)?.nombre || 'Sin nombre';
      
      if (!resultado[planId]) {
        resultado[planId] = { plan_nombre: planNombre, activas: 0, total: 0 };
      }
      
      resultado[planId].total++;
      if (suscripcion.estado === 'activa') {
        resultado[planId].activas++;
      }
    });

    return Object.values(resultado);
  }
}

// =====================================================
// SERVICIOS DE TRANSACCIONES (ACTUALIZADO)
// =====================================================

export class TransaccionesService {
  static async obtenerTransaccionesPorComunidad(
    comunidadId: string,
    filtros?: {
      estado?: string;
      fechaInicio?: string;
      fechaFin?: string;
    }
  ): Promise<TransaccionSuscripcion[]> {
    let query = supabase
      .from('transacciones_suscripcion')
      .select(`
        *,
        suscripciones(
          usuario_id,
          usuarios(name, email)
        )
      `)
      .eq('comunidad_id', comunidadId);

    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros?.fechaInicio) {
      query = query.gte('fecha_creacion', filtros.fechaInicio);
    }

    if (filtros?.fechaFin) {
      query = query.lte('fecha_creacion', filtros.fechaFin);
    }

    const { data, error } = await query.order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async crearTransaccion(transaccion: Partial<TransaccionSuscripcion>): Promise<TransaccionSuscripcion> {
    const { data, error } = await supabase
      .from('transacciones_suscripcion')
      .insert(transaccion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarEstadoTransaccion(
    id: string, 
    estado: 'pendiente' | 'completada' | 'fallida' | 'reembolsada',
    referenciaExterna?: string
  ): Promise<TransaccionSuscripcion> {
    const updates: Partial<TransaccionSuscripcion> = { 
      estado,
      fecha_procesamiento: new Date().toISOString()
    };

    if (referenciaExterna) {
      updates.referencia_externa = referenciaExterna;
    }

    const { data, error } = await supabase
      .from('transacciones_suscripcion')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// =====================================================
// SERVICIOS DE DESCUENTOS (ACTUALIZADO)
// =====================================================

export class DescuentosService {
  static async obtenerDescuentosPorComunidad(comunidadId: string): Promise<CodigoDescuento[]> {
    const { data, error } = await supabase
      .from('codigos_descuento')
      .select('*')
      .eq('comunidad_id', comunidadId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async validarCodigoDescuento(codigo: string, comunidadId: string): Promise<CodigoDescuento | null> {
    const ahora = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('codigos_descuento')
      .select('*')
      .eq('codigo', codigo)
      .eq('comunidad_id', comunidadId)
      .eq('activo', true)
      .lte('fecha_inicio', ahora)
      .or(`fecha_fin.is.null,fecha_fin.gte.${ahora}`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // Verificar si aún tiene usos disponibles
    if (data && data.usos_maximos && data.usos_actuales >= data.usos_maximos) {
      return null;
    }

    return data;
  }

  static async aplicarCodigoDescuento(id: string): Promise<CodigoDescuento> {
    const { data, error } = await supabase
      .from('codigos_descuento')
      .update({ 
        usos_actuales: supabase.sql`usos_actuales + 1`
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async crearCodigoDescuento(descuento: Partial<CodigoDescuento>): Promise<CodigoDescuento> {
    const { data, error } = await supabase
      .from('codigos_descuento')
      .insert(descuento)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarCodigoDescuento(id: string, updates: Partial<CodigoDescuento>): Promise<CodigoDescuento> {
    const { data, error } = await supabase
      .from('codigos_descuento')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async eliminarCodigoDescuento(id: string): Promise<void> {
    const { error } = await supabase
      .from('codigos_descuento')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// =====================================================
// API PRINCIPAL (ACTUALIZADA)
// =====================================================

export const SuscripcionesAPI = {
  // Servicios de comunidades
  Comunidades: ComunidadService,
  
  // Servicios de suscripciones
  Planes: PlanesService,
  Suscripciones: SuscripcionesService,
  Transacciones: TransaccionesService,
  Descuentos: DescuentosService,
  Estadisticas: EstadisticasService,
  
  // Métodos de utilidad
  async inicializarComunidadPorCommunityId(communityId: string): Promise<Comunidad> {
    return ComunidadService.obtenerOCrearComunidadPorCommunityId(communityId);
  }
};

export default SuscripcionesAPI; 