import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { HexColorPicker } from 'react-colorful';

// Modelo de módulo con imagen de portada
type Modulo = {
  id?: string;
  titulo: string;
  descripcion: string;
  icono?: string;
  imagen_url?: string;
  orden?: number;
  color?: string;
  badge_url?: string;
};

const MODULOS_MODELO: Modulo[] = [
  {
    titulo: 'Bienvenida y visión Scalexone',
    descripcion: 'Qué es, para qué sirve, cómo puede transformar tu vida/proyecto.',
    imagen_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Mentalidad de crecimiento y futuro exponencial',
    descripcion: 'Cómo prepararte para aprovechar la IA y la automatización.',
    imagen_url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Navegación y uso de la plataforma',
    descripcion: 'Tutorial práctico de todas las secciones y herramientas.',
    imagen_url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Herramientas de IA y automatización',
    descripcion: 'Qué puedes hacer, ejemplos prácticos y casos de uso.',
    imagen_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Construcción y escalado de comunidades',
    descripcion: 'Estrategias, recursos y cómo usar Scalexone para crecer tu audiencia.',
    imagen_url: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Marca personal y monetización',
    descripcion: 'Cómo posicionarte, vender y diferenciarte usando la plataforma.',
    imagen_url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Integración de IA en tu día a día',
    descripcion: 'Automatiza tareas, crea contenido, analiza datos y más.',
    imagen_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Recursos, soporte y comunidad',
    descripcion: 'Dónde encontrar ayuda, networking y oportunidades de colaboración.',
    imagen_url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Plan de acción y próximos pasos',
    descripcion: 'Cómo avanzar, retos, certificaciones y cómo escalar tu impacto.',
    imagen_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  },
];

// Barra de progreso futurista
const ProgresoFuturista = ({ porcentaje }: { porcentaje: number }) => (
  <div className="w-full h-3 rounded-full bg-gray-200 relative overflow-hidden mt-2 mb-1">
    <div
      className="h-3 rounded-full transition-all duration-700"
      style={{
        width: `${porcentaje}%`,
        background: 'linear-gradient(90deg, #1976d2 0%, #00e676 100%)',
        boxShadow: '0 0 12px 2px #00e67699, 0 0 4px 1px #1976d2cc',
      }}
    />
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-700" style={{textShadow:'0 0 4px #fff'}}>{porcentaje}%</span>
  </div>
);

const Classroom = () => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editImg, setEditImg] = useState('');
  const [editColor, setEditColor] = useState('#fff');
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    fetchModulos();
  }, []);

  const fetchModulos = async () => {
    const { data } = await supabase.from('classroom_modulos').select('*').order('orden');
    if (data && data.length > 0) setModulos(data as Modulo[]);
    else setModulos(MODULOS_MODELO);
  };

  // Simulación de progreso y badges (en real, consulta a Supabase)
  const getProgreso = (mod: Modulo, idx: number) => Math.floor(Math.random() * 100);
  const getBadge = (mod: Modulo, idx: number) => mod.badge_url || (getProgreso(mod, idx) === 100 ? '🏆' : null);

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditImg(modulos[idx].imagen_url || '');
    setEditColor(modulos[idx].color || '#fff');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editIdx === null) return;
    const mod = modulos[editIdx];
    if (mod.id) {
      await supabase.from('classroom_modulos').update({ imagen_url: editImg, color: editColor }).eq('id', mod.id);
      await fetchModulos();
    } else {
      // Si es modelo local, solo actualiza el estado local
      const nuevos = [...modulos];
      nuevos[editIdx] = { ...nuevos[editIdx], imagen_url: editImg, color: editColor };
      setModulos(nuevos);
    }
    setShowEditModal(false);
    setEditIdx(null);
  };

  return (
    <div className="min-h-screen w-full py-12 px-2" style={{ background: '#f5f6fa' }}>
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-12">Classroom de Inducción</h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">
        {modulos.map((mod, idx) => (
          <div
            key={mod.id || idx}
            className="w-full max-w-xs bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col cursor-pointer hover:scale-105 transition-transform relative group"
            style={{ background: mod.color || '#fff' }}
            onClick={() => navigate(`/classroom/modulo/${mod.id || idx}`)}
          >
            {/* Imagen de portada */}
            <div className="h-40 w-full rounded-t-2xl overflow-hidden flex items-center justify-center bg-gray-100">
              {mod.imagen_url ? (
                <img src={mod.imagen_url} alt={mod.titulo} className="object-cover w-full h-full" />
              ) : (
                <span className="text-6xl">{mod.icono || '📦'}</span>
              )}
            </div>
            {/* Badge si aplica */}
            {getBadge(mod, idx) && (
              <div className="absolute top-3 right-3 text-2xl z-10">{getBadge(mod, idx)}</div>
            )}
            <div className="flex-1 flex flex-col p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">{mod.titulo}</h2>
              <p className="text-gray-600 text-sm mb-4 text-center">{mod.descripcion}</p>
              <ProgresoFuturista porcentaje={getProgreso(mod, idx)} />
            </div>
            {/* Overlay de edición solo admin */}
            {isAdmin && (
              <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition z-20">
                <button className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold" onClick={e => { e.stopPropagation(); handleEdit(idx); }}>Editar portada/color</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">Eliminar</button>
                <button className="bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold">Personalizar</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Modal de edición de portada y color */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Editar portada y color</h2>
            <label className="text-gray-700 font-semibold">URL de la imagen de portada</label>
            <input type="text" className="p-2 rounded border border-gray-300" value={editImg} onChange={e => setEditImg(e.target.value)} />
            <label className="text-gray-700 font-semibold">Color de fondo de la tarjeta</label>
            <HexColorPicker color={editColor} onChange={setEditColor} />
            <div className="flex gap-4 mt-2">
              <button onClick={handleSaveEdit} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">Guardar</button>
              <button onClick={() => setShowEditModal(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classroom; 