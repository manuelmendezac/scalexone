import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

interface NivelVentas {
  id: number;
  nombre: string;
  min_ventas: number;
  max_ventas: number;
  descripcion: string;
}
interface NivelAcademico {
  id: number;
  nombre: string;
  modulos_requeridos: number;
  videos_requeridos: number;
  descripcion: string;
}

type Tab = 'ventas' | 'educacion';

export default function LevelsSection() {
  const [tab, setTab] = useState<Tab>('ventas');
  const [nivelesVentas, setNivelesVentas] = useState<NivelVentas[]>([]);
  const [nivelesAcademicos, setNivelesAcademicos] = useState<NivelAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch niveles
  useEffect(() => {
    fetchNiveles();
  }, []);

  async function fetchNiveles() {
    setLoading(true);
    setError(null);
    try {
      const { data: ventas } = await supabase.from('niveles_ventas').select('*').order('min_ventas');
      const { data: academicos } = await supabase.from('niveles_academicos').select('*').order('modulos_requeridos');
      setNivelesVentas(ventas || []);
      setNivelesAcademicos(academicos || []);
    } catch (e: any) {
      setError('Error al cargar niveles: ' + e.message);
    }
    setLoading(false);
  }

  // Guardar cambios
  async function guardarNiveles() {
    setSaving(true);
    setError(null);
    try {
      // Guardar ventas
      for (const nivel of nivelesVentas) {
        if (nivel.id) {
          await supabase.from('niveles_ventas').update(nivel).eq('id', nivel.id);
        } else {
          await supabase.from('niveles_ventas').insert({ ...nivel, id: undefined });
        }
      }
      // Guardar academicos
      for (const nivel of nivelesAcademicos) {
        if (nivel.id) {
          await supabase.from('niveles_academicos').update(nivel).eq('id', nivel.id);
        } else {
          await supabase.from('niveles_academicos').insert({ ...nivel, id: undefined });
        }
      }
      fetchNiveles();
    } catch (e: any) {
      setError('Error al guardar: ' + e.message);
    }
    setSaving(false);
  }

  // Eliminar nivel
  async function eliminarNivel(tab: Tab, id: number) {
    if (!window.confirm('¿Seguro que quieres eliminar este nivel?')) return;
    setSaving(true);
    setError(null);
    try {
      if (tab === 'ventas') {
        await supabase.from('niveles_ventas').delete().eq('id', id);
      } else {
        await supabase.from('niveles_academicos').delete().eq('id', id);
      }
      fetchNiveles();
    } catch (e: any) {
      setError('Error al eliminar: ' + e.message);
    }
    setSaving(false);
  }

  // Añadir nivel
  function agregarNivel(tab: Tab) {
    if (tab === 'ventas') {
      setNivelesVentas([...nivelesVentas, { id: 0, nombre: '', min_ventas: 0, max_ventas: 0, descripcion: '' }]);
    } else {
      setNivelesAcademicos([...nivelesAcademicos, { id: 0, nombre: '', modulos_requeridos: 0, videos_requeridos: 0, descripcion: '' }]);
    }
  }

  return (
    <div className="bg-[#23232b] rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Gestión de Niveles</h2>
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${tab === 'ventas' ? 'bg-yellow-400 text-black font-bold' : 'bg-neutral-800 text-white'}`}
          onClick={() => setTab('ventas')}
        >
          Niveles por Ventas
        </button>
        <button
          className={`px-4 py-2 rounded ${tab === 'educacion' ? 'bg-yellow-400 text-black font-bold' : 'bg-neutral-800 text-white'}`}
          onClick={() => setTab('educacion')}
        >
          Niveles por Educación
        </button>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {loading ? (
        <div className="text-white">Cargando niveles...</div>
      ) : (
        <>
          {tab === 'ventas' ? (
            <div>
              <table className="w-full mb-4">
                <thead>
                  <tr className="text-yellow-400">
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Mín. Ventas</th>
                    <th className="p-2">Máx. Ventas</th>
                    <th className="p-2">Descripción</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {nivelesVentas.map((nivel, idx) => (
                    <tr key={nivel.id || idx} className="bg-neutral-900 border-b border-neutral-800">
                      <td className="p-2">
                        <input
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.nombre}
                          onChange={e => {
                            const nuevos = [...nivelesVentas];
                            nuevos[idx].nombre = e.target.value;
                            setNivelesVentas(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.min_ventas}
                          onChange={e => {
                            const nuevos = [...nivelesVentas];
                            nuevos[idx].min_ventas = Number(e.target.value);
                            setNivelesVentas(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.max_ventas}
                          onChange={e => {
                            const nuevos = [...nivelesVentas];
                            nuevos[idx].max_ventas = Number(e.target.value);
                            setNivelesVentas(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.descripcion}
                          onChange={e => {
                            const nuevos = [...nivelesVentas];
                            nuevos[idx].descripcion = e.target.value;
                            setNivelesVentas(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                          onClick={() => eliminarNivel('ventas', nivel.id)}
                          disabled={saving}
                        >Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded font-bold hover:bg-green-400 mr-2"
                onClick={() => agregarNivel('ventas')}
                disabled={saving}
              >
                + Agregar Nivel
              </button>
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300"
                onClick={guardarNiveles}
                disabled={saving}
              >
                Guardar Cambios
              </button>
            </div>
          ) : (
            <div>
              <table className="w-full mb-4">
                <thead>
                  <tr className="text-yellow-400">
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Módulos Req.</th>
                    <th className="p-2">Videos Req.</th>
                    <th className="p-2">Descripción</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {nivelesAcademicos.map((nivel, idx) => (
                    <tr key={nivel.id || idx} className="bg-neutral-900 border-b border-neutral-800">
                      <td className="p-2">
                        <input
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.nombre}
                          onChange={e => {
                            const nuevos = [...nivelesAcademicos];
                            nuevos[idx].nombre = e.target.value;
                            setNivelesAcademicos(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.modulos_requeridos}
                          onChange={e => {
                            const nuevos = [...nivelesAcademicos];
                            nuevos[idx].modulos_requeridos = Number(e.target.value);
                            setNivelesAcademicos(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.videos_requeridos}
                          onChange={e => {
                            const nuevos = [...nivelesAcademicos];
                            nuevos[idx].videos_requeridos = Number(e.target.value);
                            setNivelesAcademicos(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          value={nivel.descripcion}
                          onChange={e => {
                            const nuevos = [...nivelesAcademicos];
                            nuevos[idx].descripcion = e.target.value;
                            setNivelesAcademicos(nuevos);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                          onClick={() => eliminarNivel('educacion', nivel.id)}
                          disabled={saving}
                        >Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded font-bold hover:bg-green-400 mr-2"
                onClick={() => agregarNivel('educacion')}
                disabled={saving}
              >
                + Agregar Nivel
              </button>
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300"
                onClick={guardarNiveles}
                disabled={saving}
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 