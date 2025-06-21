import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

interface NivelVentas {
  id: string;
  nombre: string;
  min_ventas: number;
  max_ventas: number;
  color: string;
  icono: string;
  descripcion: string;
}

interface NivelAcademico {
  id: string;
  nombre: string;
  modulos_requeridos: number;
  videos_requeridos: number;
  descripcion: string;
  xp_requerido?: number;
}

type Tab = 'ventas' | 'educacion';

const LevelsSection: React.FC = () => {
  const [tab, setTab] = useState<Tab>('ventas');
  const [nivelesVentas, setNivelesVentas] = useState<NivelVentas[]>([]);
  const [nivelesAcademicos, setNivelesAcademicos] = useState<NivelAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNiveles();
  }, []);

  async function fetchNiveles() {
    try {
      setLoading(true);
      // Cargar niveles de ventas
      const { data: ventasData, error: ventasError } = await supabase
        .from('niveles_ventas')
        .select('*')
        .order('min_ventas', { ascending: true });

      if (ventasError) throw ventasError;
      setNivelesVentas(ventasData || []);

      // Cargar niveles académicos
      const { data: academicosData, error: academicosError } = await supabase
        .from('niveles_academicos')
        .select('*')
        .order('modulos_requeridos', { ascending: true });

      if (academicosError) throw academicosError;
      setNivelesAcademicos(academicosData || []);
    } catch (err: any) {
      console.error('Error al cargar niveles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function guardarNivelVentas(nivel: NivelVentas) {
    try {
      const { error } = await supabase
        .from('niveles_ventas')
        .upsert({
          id: nivel.id || crypto.randomUUID(),
          nombre: nivel.nombre,
          min_ventas: nivel.min_ventas,
          max_ventas: nivel.max_ventas,
          color: nivel.color,
          icono: nivel.icono,
          descripcion: nivel.descripcion
        });

      if (error) throw error;
      await fetchNiveles();
    } catch (err: any) {
      setError('Error al guardar nivel de ventas: ' + err.message);
    }
  }

  async function guardarNivelAcademico(nivel: NivelAcademico) {
    try {
      const { error } = await supabase
        .from('niveles_academicos')
        .upsert({
          id: nivel.id || crypto.randomUUID(),
          nombre: nivel.nombre,
          modulos_requeridos: nivel.modulos_requeridos,
          videos_requeridos: nivel.videos_requeridos,
          descripcion: nivel.descripcion,
          xp_requerido: nivel.xp_requerido
        });

      if (error) throw error;
      await fetchNiveles();
    } catch (err: any) {
      setError('Error al guardar nivel académico: ' + err.message);
    }
  }

  async function eliminarNivel(tipo: Tab, id: string) {
    if (!window.confirm('¿Seguro que deseas eliminar este nivel?')) return;
    
    try {
      const { error } = await supabase
        .from(tipo === 'ventas' ? 'niveles_ventas' : 'niveles_academicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchNiveles();
    } catch (err: any) {
      setError(`Error al eliminar nivel: ${err.message}`);
    }
  }

  function agregarNivelVentas() {
    const nuevoNivel: NivelVentas = {
      id: crypto.randomUUID(),
      nombre: '',
      min_ventas: 0,
      max_ventas: 100,
      color: '#FFD700',
      icono: '⭐',
      descripcion: ''
    };
    setNivelesVentas([...nivelesVentas, nuevoNivel]);
  }

  function agregarNivelAcademico() {
    const nuevoNivel: NivelAcademico = {
      id: crypto.randomUUID(),
      nombre: '',
      modulos_requeridos: 0,
      videos_requeridos: 0,
      descripcion: ''
    };
    setNivelesAcademicos([...nivelesAcademicos, nuevoNivel]);
  }

  function handleAcademicoChange(index: number, field: keyof NivelAcademico, value: string | number) {
    const nuevos = [...nivelesAcademicos];
    (nuevos[index] as any)[field] = value;
    setNivelesAcademicos(nuevos);
  }

  if (loading) return <div className="text-center p-4">Cargando niveles...</div>;

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#FFD700] mb-2">Configuración de Niveles</h2>
        <p className="text-gray-400 text-sm mb-4">
          Configura los niveles de gamificación para tu plataforma. Puedes definir niveles basados en ventas o en progreso educativo.
        </p>

        {/* Tabs de selección */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('ventas')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              tab === 'ventas'
                ? 'bg-[#FFD700] text-black'
                : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
            }`}
          >
            Niveles por Ventas
          </button>
          <button
            onClick={() => setTab('educacion')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              tab === 'educacion'
                ? 'bg-[#FFD700] text-black'
                : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
            }`}
          >
            Niveles por Educación
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {tab === 'ventas' ? (
          // Niveles de Ventas
          <>
            {nivelesVentas.map((nivel, index) => (
              <div key={index} className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Nivel
                    </label>
                    <input
                      type="text"
                      value={nivel.nombre}
                      onChange={(e) => {
                        const nuevos = [...nivelesVentas];
                        nuevos[index].nombre = e.target.value;
                        setNivelesVentas(nuevos);
                      }}
                      className="w-full bg-[#1a1a1a] text-white p-3 rounded border border-gray-700 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]"
                      placeholder="Ej: Principiante, Experto, Elite..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ventas Mínimas (USD)
                    </label>
                    <input
                      type="number"
                      value={nivel.min_ventas}
                      onChange={(e) => {
                        const nuevos = [...nivelesVentas];
                        nuevos[index].min_ventas = Number(e.target.value);
                        setNivelesVentas(nuevos);
                      }}
                      className="w-full bg-[#1a1a1a] text-white p-3 rounded border border-gray-700 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]"
                      placeholder="Ej: 0, 100, 500..."
                      min="0"
                      step="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ventas Máximas (USD)
                    </label>
                    <input
                      type="number"
                      value={nivel.max_ventas}
                      onChange={(e) => {
                        const nuevos = [...nivelesVentas];
                        nuevos[index].max_ventas = Number(e.target.value);
                        setNivelesVentas(nuevos);
                      }}
                      className="w-full bg-[#1a1a1a] text-white p-3 rounded border border-gray-700 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]"
                      placeholder="Ej: 100, 500, 1000..."
                      min="0"
                      step="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color del Nivel
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={nivel.color}
                        onChange={(e) => {
                          const nuevos = [...nivelesVentas];
                          nuevos[index].color = e.target.value;
                          setNivelesVentas(nuevos);
                        }}
                        className="h-10 w-20 rounded border border-gray-700"
                      />
                      <span className="text-gray-400 text-sm">
                        {nivel.color.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Icono del Nivel
                    </label>
                    <input
                      type="text"
                      value={nivel.icono}
                      onChange={(e) => {
                        const nuevos = [...nivelesVentas];
                        nuevos[index].icono = e.target.value;
                        setNivelesVentas(nuevos);
                      }}
                      className="w-full bg-[#1a1a1a] text-white p-3 rounded border border-gray-700 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]"
                      placeholder="Ej: ⭐ 🌟 💎 🏆"
                      maxLength={2}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción del Nivel
                    </label>
                    <textarea
                      value={nivel.descripcion}
                      onChange={(e) => {
                        const nuevos = [...nivelesVentas];
                        nuevos[index].descripcion = e.target.value;
                        setNivelesVentas(nuevos);
                      }}
                      className="w-full bg-[#1a1a1a] text-white p-3 rounded border border-gray-700 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] h-24"
                      placeholder="Describe los beneficios y características de este nivel..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => eliminarNivel('ventas', nivel.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Eliminar Nivel
                  </button>
                  <button
                    onClick={() => guardarNivelVentas(nivel)}
                    className="px-4 py-2 bg-[#FFD700] text-black font-medium rounded hover:bg-yellow-500 transition-colors"
                  >
                    Guardar Nivel
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={agregarNivelVentas}
              className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition-colors font-medium"
            >
              + Agregar Nuevo Nivel de Ventas
            </button>
          </>
        ) : (
          // Niveles de Educación
          <>
            {nivelesAcademicos.map((nivel, index) => (
              <div key={index} className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`nombre-academico-${nivel.id}`} className="block text-sm font-medium text-gray-300 mb-1">Nombre del Nivel</label>
                      <input
                        type="text"
                        id={`nombre-academico-${nivel.id}`}
                        value={nivel.nombre}
                        onChange={(e) => handleAcademicoChange(index, 'nombre', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`modulos-requeridos-${nivel.id}`} className="block text-sm font-medium text-gray-300 mb-1">Módulos Requeridos</label>
                      <input
                        type="number"
                        id={`modulos-requeridos-${nivel.id}`}
                        value={nivel.modulos_requeridos}
                        onChange={(e) => handleAcademicoChange(index, 'modulos_requeridos', parseInt(e.target.value, 10))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`videos-requeridos-${nivel.id}`} className="block text-sm font-medium text-gray-300 mb-1">Videos Requeridos</label>
                      <input
                        type="number"
                        id={`videos-requeridos-${nivel.id}`}
                        value={nivel.videos_requeridos}
                        onChange={(e) => handleAcademicoChange(index, 'videos_requeridos', parseInt(e.target.value, 10))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`xp-requerido-${nivel.id}`} className="block text-sm font-medium text-gray-300 mb-1">XP Requeridos</label>
                      <input
                        type="number"
                        id={`xp-requerido-${nivel.id}`}
                        value={nivel.xp_requerido || ''}
                        onChange={(e) => handleAcademicoChange(index, 'xp_requerido', parseInt(e.target.value, 10))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción del Nivel
                    </label>
                    <textarea
                      value={nivel.descripcion}
                      onChange={(e) => handleAcademicoChange(index, 'descripcion', e.target.value)}
                      className="w-full bg-[#1a1a1a] text-white p-3 rounded border border-gray-700 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] h-24"
                      placeholder="Describe los beneficios y características de este nivel..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => eliminarNivel('educacion', nivel.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Eliminar Nivel
                  </button>
                  <button
                    onClick={() => guardarNivelAcademico(nivel)}
                    className="px-4 py-2 bg-[#FFD700] text-black font-medium rounded hover:bg-yellow-500 transition-colors"
                  >
                    Guardar Nivel
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={agregarNivelAcademico}
              className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition-colors font-medium"
            >
              + Agregar Nuevo Nivel de Educación
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelsSection; 