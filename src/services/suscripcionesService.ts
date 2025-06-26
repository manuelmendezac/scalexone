import { supabase } from '../supabase';

// =====================================================
// TIPOS DE DATOS
// =====================================================

export interface Organizacion {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  logo_url?: string;
  dominio_personalizado?: string;
  configuracion: Record<string, any>;
  estado: 'activa' | 'suspendida' | 'cancelada';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PlanSuscripcion {
  id: string;
  organizacion_id: string;
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
  organizacion_id: string;
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
}

export interface SuscripcionConDetalles extends Suscripcion {
  usuario_nombre: string;
  usuario_email: string;
  plan_nombre: string;
  plan_precio: number;
  organizacion_nombre: string;
}

export interface TransaccionSuscripcion {
  id: string;
  suscripcion_id: string;
  organizacion_id: string;
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
  organizacion_id: string;
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

export interface EstadisticasOrganizacion {
  organizacion_id: string;
  organizacion_nombre: string;
  total_suscripciones: number;
  suscripciones_activas: number;
  ingresos_mensuales: number;
  tasa_retencion: number;
}

// =====================================================
// SERVICIOS DE ORGANIZACIONES
// =====================================================

export class OrganizacionService {
  static async obtenerOrganizaciones(): Promise<Organizacion[]> {
    const { data, error } = await supabase
      .from('organizaciones')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data || [];
  }

  static async obtenerOrganizacionPorSlug(slug: string): Promise<Organizacion | null> {
    const { data, error } = await supabase
      .from('organizaciones')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async crearOrganizacion(organizacion: Partial<Organizacion>): Promise<Organizacion> {
    const { data, error } = await supabase
      .from('organizaciones')
      .insert(organizacion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarOrganizacion(id: string, updates: Partial<Organizacion>): Promise<Organizacion> {
    const { data, error } = await supabase
      .from('organizaciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// =====================================================
// SERVICIOS DE PLANES
// =====================================================

export class PlanesService {
  static async obtenerPlanesPorOrganizacion(organizacionId: string): Promise<PlanSuscripcion[]> {
    const { data, error } = await supabase
      .from('planes_suscripcion')
      .select('*')
      .eq('organizacion_id', organizacionId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async obtenerPlanesActivos(organizacionId: string): Promise<PlanSuscripcion[]> {
    const { data, error } = await supabase
      .from('planes_suscripcion')
      .select('*')
      .eq('organizacion_id', organizacionId)
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
    // Primero obtenemos el plan actual
    const { data: planActual, error: errorGet } = await supabase
      .from('planes_suscripcion')
      .select('activo')
      .eq('id', id)
      .single();

    if (errorGet) throw errorGet;

    // Cambiamos el estado
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
// SERVICIOS DE SUSCRIPCIONES
// =====================================================

export class SuscripcionesService {
  static async obtenerSuscripcionesPorOrganizacion(
    organizacionId: string,
    filtros?: {
      estado?: string;
      busqueda?: string;
      planId?: string;
    }
  ): Promise<SuscripcionConDetalles[]> {
    let query = supabase
      .from('vista_suscripciones_activas')
      .select('*')
      .eq('organizacion_id', organizacionId);

    // Aplicar filtros
    if (filtros?.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros?.planId) {
      query = query.eq('plan_id', filtros.planId);
    }

    if (filtros?.busqueda) {
      query = query.or(`usuario_nombre.ilike.%${filtros.busqueda}%,usuario_email.ilike.%${filtros.busqueda}%,plan_nombre.ilike.%${filtros.busqueda}%`);
    }

    query = query.order('fecha_creacion', { ascending: false });

    const { data, error } = await query;

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
    // Aquí podrías agregar lógica adicional para calcular prorrateo, etc.
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
    const { error } = await supabase.rpc('verificar_suscripciones_vencidas');
    if (error) throw error;
  }
}

// =====================================================
// SERVICIOS DE ESTADÍSTICAS
// =====================================================

export class EstadisticasService {
  static async obtenerEstadisticasOrganizacion(organizacionId: string): Promise<EstadisticasOrganizacion | null> {
    const { data, error } = await supabase
      .from('vista_estadisticas_organizacion')
      .select('*')
      .eq('organizacion_id', organizacionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async obtenerIngresosPorMes(organizacionId: string, meses: number = 12): Promise<any[]> {
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - meses);

    const { data, error } = await supabase
      .from('transacciones_suscripcion')
      .select('monto, fecha_procesamiento')
      .eq('organizacion_id', organizacionId)
      .eq('estado', 'completada')
      .gte('fecha_procesamiento', fechaInicio.toISOString())
      .order('fecha_procesamiento');

    if (error) throw error;

    // Agrupar por mes
    const ingresosPorMes: Record<string, number> = {};
    
    data?.forEach(transaccion => {
      if (transaccion.fecha_procesamiento) {
        const fecha = new Date(transaccion.fecha_procesamiento);
        const clave = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
        ingresosPorMes[clave] = (ingresosPorMes[clave] || 0) + transaccion.monto;
      }
    });

    return Object.entries(ingresosPorMes).map(([mes, total]) => ({
      mes,
      total
    }));
  }

  static async obtenerSuscripcionesPorPlan(organizacionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('suscripciones')
      .select(`
        plan_id,
        planes_suscripcion!inner(nombre),
        estado
      `)
      .eq('organizacion_id', organizacionId);

    if (error) throw error;

    // Agrupar por plan
    const suscripcionesPorPlan: Record<string, any> = {};
    
    data?.forEach(suscripcion => {
      const planNombre = (suscripcion as any).planes_suscripcion.nombre;
      if (!suscripcionesPorPlan[planNombre]) {
        suscripcionesPorPlan[planNombre] = {
          plan: planNombre,
          total: 0,
          activas: 0,
          canceladas: 0,
          vencidas: 0
        };
      }
      
      suscripcionesPorPlan[planNombre].total++;
      suscripcionesPorPlan[planNombre][suscripcion.estado] = 
        (suscripcionesPorPlan[planNombre][suscripcion.estado] || 0) + 1;
    });

    return Object.values(suscripcionesPorPlan);
  }
}

// =====================================================
// SERVICIOS DE TRANSACCIONES
// =====================================================

export class TransaccionesService {
  static async obtenerTransaccionesPorOrganizacion(
    organizacionId: string,
    filtros?: {
      estado?: string;
      fechaInicio?: string;
      fechaFin?: string;
    }
  ): Promise<TransaccionSuscripcion[]> {
    let query = supabase
      .from('transacciones_suscripcion')
      .select('*')
      .eq('organizacion_id', organizacionId);

    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros?.fechaInicio) {
      query = query.gte('fecha_creacion', filtros.fechaInicio);
    }

    if (filtros?.fechaFin) {
      query = query.lte('fecha_creacion', filtros.fechaFin);
    }

    query = query.order('fecha_creacion', { ascending: false });

    const { data, error } = await query;

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
    const updates: any = { 
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
// SERVICIOS DE CÓDIGOS DE DESCUENTO
// =====================================================

export class DescuentosService {
  static async obtenerDescuentosPorOrganizacion(organizacionId: string): Promise<CodigoDescuento[]> {
    const { data, error } = await supabase
      .from('codigos_descuento')
      .select('*')
      .eq('organizacion_id', organizacionId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async validarCodigoDescuento(codigo: string, organizacionId: string): Promise<CodigoDescuento | null> {
    const { data, error } = await supabase
      .from('codigos_descuento')
      .select('*')
      .eq('codigo', codigo)
      .eq('organizacion_id', organizacionId)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      // Verificar si el código está dentro del rango de fechas
      const ahora = new Date();
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = data.fecha_fin ? new Date(data.fecha_fin) : null;

      if (ahora < fechaInicio || (fechaFin && ahora > fechaFin)) {
        return null; // Código expirado o no válido aún
      }

      // Verificar límite de usos
      if (data.usos_maximos && data.usos_actuales >= data.usos_maximos) {
        return null; // Código agotado
      }
    }

    return data;
  }

  static async aplicarCodigoDescuento(id: string): Promise<CodigoDescuento> {
    // Primero obtenemos el valor actual
    const { data: current, error: errorGet } = await supabase
      .from('codigos_descuento')
      .select('usos_actuales')
      .eq('id', id)
      .single();

    if (errorGet) throw errorGet;

    // Incrementamos el contador
    const { data, error } = await supabase
      .from('codigos_descuento')
      .update({ usos_actuales: (current.usos_actuales || 0) + 1 })
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
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

export const SuscripcionesAPI = {
  organizaciones: OrganizacionService,
  planes: PlanesService,
  suscripciones: SuscripcionesService,
  estadisticas: EstadisticasService,
  transacciones: TransaccionesService,
  descuentos: DescuentosService
}; 