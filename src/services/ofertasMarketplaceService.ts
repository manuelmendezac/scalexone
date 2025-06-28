import { supabase } from '../supabase';

// =====================================================
// INTERFACES Y TIPOS ACTUALIZADOS PARA LA VISTA
// =====================================================

export interface OfertaMarketplace {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo_producto: 'curso' | 'servicio' | 'suscripcion';
  precio: number;
  precio_original?: number;
  moneda?: string;
  
  // Información del producto
  imagen_url?: string;
  proveedor: string;
  categoria: string;
  
  // Métricas y rating
  rating: number;
  reviews: number;
  ventas_totales: number;
  
  // Características específicas
  caracteristicas?: any;
  
  // Para cursos
  duracion_horas?: number;
  nivel?: string;
  instructor?: string;
  certificado?: boolean;
  
  // Para servicios
  duracion_dias?: number;
  incluye_soporte?: boolean;
  tipo_entrega?: string;
  
  // Sistema de afiliación
  afilible: boolean;
  niveles_comision?: number;
  comision_nivel1: number;
  comision_nivel2: number;
  comision_nivel3: number;
  
  // Estado y ordenamiento
  activo: boolean;
  destacado: boolean;
  orden: number;
  
  // Timestamps
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Campos adicionales de compatibilidad
  community_id?: string;
  plan_suscripcion_id?: string;
  plan_duracion_dias?: number;
}

export interface FiltrosOfertas {
  categoria?: string;
  tipo_producto?: string;
  precio_min?: number;
  precio_max?: number;
  rating_min?: number;
  busqueda?: string;
  solo_destacadas?: boolean;
  solo_afiliables?: boolean;
  ordenar_por?: 'precio_asc' | 'precio_desc' | 'rating' | 'popularidad' | 'nuevo';
  limite?: number;
  offset?: number;
}

// =====================================================
// SERVICIOS DE OFERTAS MARKETPLACE - USANDO VISTA
// =====================================================

export class OfertasMarketplaceService {
  
  // Obtener todas las ofertas con filtros (usando vista)
  static async obtenerOfertas(filtros: FiltrosOfertas = {}): Promise<OfertaMarketplace[]> {
    let query = supabase
      .from('ofertas_marketplace_vista')
      .select('*')
      .eq('activo', true);

    // Aplicar filtros
    if (filtros.categoria) {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros.tipo_producto) {
      query = query.eq('tipo_producto', filtros.tipo_producto);
    }

    if (filtros.precio_min !== undefined) {
      query = query.gte('precio', filtros.precio_min);
    }

    if (filtros.precio_max !== undefined) {
      query = query.lte('precio', filtros.precio_max);
    }

    if (filtros.rating_min !== undefined) {
      query = query.gte('rating', filtros.rating_min);
    }

    if (filtros.busqueda) {
      query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`);
    }

    if (filtros.solo_destacadas) {
      query = query.eq('destacado', true);
    }

    if (filtros.solo_afiliables) {
      query = query.eq('afilible', true);
    }

    // Aplicar ordenamiento
    switch (filtros.ordenar_por) {
      case 'precio_asc':
        query = query.order('precio', { ascending: true });
        break;
      case 'precio_desc':
        query = query.order('precio', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'nuevo':
        query = query.order('fecha_creacion', { ascending: false });
        break;
      case 'popularidad':
      default:
        query = query.order('ventas_totales', { ascending: false });
        break;
    }

    // Aplicar paginación
    if (filtros.limite) {
      query = query.limit(filtros.limite);
    }

    if (filtros.offset) {
      query = query.range(filtros.offset, filtros.offset + (filtros.limite || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Obtener ofertas afiliables (usando vista)
  static async obtenerOfertasAfiliables(): Promise<OfertaMarketplace[]> {
    const { data, error } = await supabase
      .from('ofertas_marketplace_vista')
      .select('*')
      .eq('activo', true)
      .eq('afilible', true)
      .order('comision_nivel1', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Obtener una oferta por ID (usando vista)
  static async obtenerOfertaPorId(id: string): Promise<OfertaMarketplace | null> {
    const { data, error } = await supabase
      .from('ofertas_marketplace_vista')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Buscar ofertas por texto (usando vista)
  static async buscarOfertas(termino: string, limite: number = 20): Promise<OfertaMarketplace[]> {
    const { data, error } = await supabase
      .from('ofertas_marketplace_vista')
      .select('*')
      .eq('activo', true)
      .or(`titulo.ilike.%${termino}%,descripcion.ilike.%${termino}%,proveedor.ilike.%${termino}%`)
      .order('ventas_totales', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  // Obtener ofertas destacadas (usando vista)
  static async obtenerOfertasDestacadas(limite: number = 10): Promise<OfertaMarketplace[]> {
    const { data, error } = await supabase
      .from('ofertas_marketplace_vista')
      .select('*')
      .eq('activo', true)
      .eq('destacado', true)
      .order('orden', { ascending: true })
      .order('fecha_creacion', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  // Obtener ofertas por categoría (usando vista)
  static async obtenerOfertasPorCategoria(categoria: string, limite: number = 20): Promise<OfertaMarketplace[]> {
    const { data, error } = await supabase
      .from('ofertas_marketplace_vista')
      .select('*')
      .eq('activo', true)
      .eq('categoria', categoria)
      .order('ventas_totales', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  // Obtener ofertas por tipo de producto (usando vista)
  static async obtenerOfertasPorTipo(tipo: string, limite: number = 20): Promise<OfertaMarketplace[]> {
    const { data, error } = await supabase
      .from('ofertas_marketplace_vista')
      .select('*')
      .eq('activo', true)
      .eq('tipo_producto', tipo)
      .order('ventas_totales', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  // Obtener estadísticas generales (usando vista)
  static async obtenerEstadisticas(): Promise<{
    total_ofertas: number;
    ofertas_activas: number;
    ofertas_afiliables: number;
    ofertas_destacadas: number;
    ofertas_por_tipo: Record<string, number>;
    ofertas_por_categoria: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('ofertas_marketplace_vista')
      .select('*');

    if (error) throw error;

    const ofertas = data || [];
    const activas = ofertas.filter(o => o.activo);
    
    return {
      total_ofertas: ofertas.length,
      ofertas_activas: activas.length,
      ofertas_afiliables: activas.filter(o => o.afilible).length,
      ofertas_destacadas: activas.filter(o => o.destacado).length,
      ofertas_por_tipo: activas.reduce((acc, o) => {
        acc[o.tipo_producto] = (acc[o.tipo_producto] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      ofertas_por_categoria: activas.reduce((acc, o) => {
        acc[o.categoria] = (acc[o.categoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export default OfertasMarketplaceService;
