import { create } from 'zustand';
import { supabase } from '../supabase';
import { registrarVenta } from '../utils/actualizarNivelUsuario';

interface Venta {
  id: string;
  usuario_id: string;
  monto: number;
  producto_id: string;
  fecha: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
}

interface VentasStore {
  ventas: Venta[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  mensaje: string | null;

  // Acciones
  fetchVentas: (rol?: string) => Promise<void>;
  registrarNuevaVenta: (monto: number, producto_id: string) => Promise<void>;
  confirmarVenta: (venta_id: string) => Promise<void>;
  cancelarVenta: (venta_id: string) => Promise<void>;
  setMensaje: (msg: string | null) => void;
}

const CACHE_DURATION = 60000; // 1 minuto

const useVentasStore = create<VentasStore>((set, get) => ({
  ventas: [],
  loading: false,
  error: null,
  lastFetch: null,
  mensaje: null,

  fetchVentas: async (rol?: string) => {
    const now = Date.now();
    const lastFetch = get().lastFetch;

    // Si tenemos datos en caché y no ha pasado 1 minuto, usamos el caché
    if (lastFetch && now - lastFetch < CACHE_DURATION && get().ventas.length > 0) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      let query = supabase.from('ventas').select('*').order('fecha', { ascending: false });
      if (rol !== 'admin' && rol !== 'superadmin') {
        query = query.eq('usuario_id', user.id);
      }
      const { data, error } = await query;

      if (error) throw error;

      set({
        ventas: data || [],
        lastFetch: Date.now()
      });
    } catch (error) {
      console.error('Error fetching ventas:', error);
      set({ error: error instanceof Error ? error.message : 'Error al cargar las ventas' });
    } finally {
      set({ loading: false });
    }
  },

  registrarNuevaVenta: async (monto: number, producto_id: string) => {
    set({ loading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // 1. Registrar la venta
      const { data, error } = await supabase
        .from('ventas')
        .insert({
          usuario_id: user.id,
          monto,
          producto_id,
          fecha: new Date().toISOString(),
          estado: 'pendiente'
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Actualizar el store
      set(state => ({
        ventas: [data, ...state.ventas],
        mensaje: '¡Venta registrada con éxito!'
      }));

      // Limpiar mensaje después de 2 segundos
      setTimeout(() => set({ mensaje: null }), 2000);

    } catch (error) {
      console.error('Error al registrar venta:', error);
      set({ error: error instanceof Error ? error.message : 'Error al registrar la venta' });
    } finally {
      set({ loading: false });
    }
  },

  confirmarVenta: async (venta_id: string) => {
    set({ loading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // 1. Obtener la venta
      const { data: venta } = await supabase
        .from('ventas')
        .select('*')
        .eq('id', venta_id)
        .single();

      if (!venta) throw new Error('Venta no encontrada');

      // 2. Confirmar la venta
      const { error } = await supabase
        .from('ventas')
        .update({ estado: 'confirmada' })
        .eq('id', venta_id);

      if (error) throw error;

      // 3. Registrar progreso y actualizar nivel
      await registrarVenta(user.id, venta.monto);

      // 4. Actualizar el store
      set(state => ({
        ventas: state.ventas.map(v => 
          v.id === venta_id ? { ...v, estado: 'confirmada' } : v
        ),
        mensaje: '¡Venta confirmada con éxito!'
      }));

      // Limpiar mensaje después de 2 segundos
      setTimeout(() => set({ mensaje: null }), 2000);

    } catch (error) {
      console.error('Error al confirmar venta:', error);
      set({ error: error instanceof Error ? error.message : 'Error al confirmar la venta' });
    } finally {
      set({ loading: false });
    }
  },

  cancelarVenta: async (venta_id: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('ventas')
        .update({ estado: 'cancelada' })
        .eq('id', venta_id);

      if (error) throw error;

      // Actualizar el store
      set(state => ({
        ventas: state.ventas.map(v => 
          v.id === venta_id ? { ...v, estado: 'cancelada' } : v
        ),
        mensaje: 'Venta cancelada'
      }));

      // Limpiar mensaje después de 2 segundos
      setTimeout(() => set({ mensaje: null }), 2000);

    } catch (error) {
      console.error('Error al cancelar venta:', error);
      set({ error: error instanceof Error ? error.message : 'Error al cancelar la venta' });
    } finally {
      set({ loading: false });
    }
  },

  setMensaje: (msg) => set({ mensaje: msg })
}));

export default useVentasStore; 