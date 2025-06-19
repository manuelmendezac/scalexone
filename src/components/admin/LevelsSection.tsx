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

  // Eliminar nivel (mejorado para manejar niveles nuevos sin id)
  async function eliminarNivel(tab: Tab, id: number, idx: number) {
    if (!window.confirm('¿Seguro que quieres eliminar este nivel?')) return;
    setSaving(true);
    setError(null);
    try {
      if (id) {
        if (tab === 'ventas') {
          await supabase.from('niveles_ventas').delete().eq('id', id);
        } else {
          await supabase.from('niveles_academicos').delete().eq('id', id);
        }
        fetchNiveles();
      } else {
        // Si es un nivel nuevo (sin id), solo lo quitamos del array local
        if (tab === 'ventas') {
          const nuevos = [...nivelesVentas];
          nuevos.splice(idx, 1);
          setNivelesVentas(nuevos);
        } else {
          const nuevos = [...nivelesAcademicos];
          nuevos.splice(idx, 1);
          setNivelesAcademicos(nuevos);
        }
      }
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
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">Gestión de Niveles</h2>
      <p className="text-white mb-4 text-sm">
        Aquí puedes crear, editar y eliminar los niveles de gamificación de tu comunidad. <br />
        <span className="text-yellow-300">Niveles por Ventas:</span> Define los rangos de ventas acumuladas que debe alcanzar un usuario para subir de nivel.<br />
        <span className="text-yellow-300">Niveles por Educación:</span> Define cuántos módulos y videos debe completar un usuario para avanzar de nivel académico.<br />
        <span className="text-gray-400">Recuerda guardar los cambios después de editar o agregar niveles.</span>
      </p>
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
                  <tr className="text-yellow-400 text-xs">
                    <th className="p-2">Nombre<br /><span className="text-gray-400 font-normal">Ej: Starter, Pro, Elite</span></th>
                    <th className="p-2">Mín. Ventas<br /><span className="text-gray-400 font-normal">Ej: 0</span></th>
                    <th className="p-2">Máx. Ventas<br /><span className="text-gray-400 font-normal">Ej: 1000</span></th>
                    <th className="p-2">Descripción<br /><span className="text-gray-400 font-normal">Opcional</span></th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {nivelesVentas.map((nivel, idx) => (
                    <tr key={nivel.id || idx} className="bg-neutral-900 border-b border-neutral-800">
                      <td className="p-2">
                        <input
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          placeholder="Ej: Starter"
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
                          placeholder="0"
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
                          placeholder="1000"
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
                          placeholder="Descripción opcional"
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
                          title="Eliminar este nivel"
                          onClick={() => eliminarNivel('ventas', nivel.id, idx)}
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
                title="Agregar un nuevo nivel de ventas"
              >
                + Agregar Nivel
              </button>
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300"
                onClick={guardarNiveles}
                disabled={saving}
                title="Guardar todos los cambios realizados"
              >
                Guardar Cambios
              </button>
            </div>
          ) : (
            <div>
              <table className="w-full mb-4">
                <thead>
                  <tr className="text-yellow-400 text-xs">
                    <th className="p-2">Nombre<br /><span className="text-gray-400 font-normal">Ej: Estudiante, Experto</span></th>
                    <th className="p-2">Módulos Req.<br /><span className="text-gray-400 font-normal">Ej: 3</span></th>
                    <th className="p-2">Videos Req.<br /><span className="text-gray-400 font-normal">Ej: 5</span></th>
                    <th className="p-2">Descripción<br /><span className="text-gray-400 font-normal">Opcional</span></th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {nivelesAcademicos.map((nivel, idx) => (
                    <tr key={nivel.id || idx} className="bg-neutral-900 border-b border-neutral-800">
                      <td className="p-2">
                        <input
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full"
                          placeholder="Ej: Estudiante"
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
                          placeholder="3"
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
                          placeholder="5"
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
                          placeholder="Descripción opcional"
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
                          title="Eliminar este nivel"
                          onClick={() => eliminarNivel('educacion', nivel.id, idx)}
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
                title="Agregar un nuevo nivel académico"
              >
                + Agregar Nivel
              </button>
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300"
                onClick={guardarNiveles}
                disabled={saving}
                title="Guardar todos los cambios realizados"
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