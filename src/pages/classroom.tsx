import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

type Modulo = {
  id?: string;
  titulo: string;
  descripcion: string;
  icono: string;
  orden?: number;
};

const MODULOS_MODELO: Modulo[] = [
  {
    titulo: 'Bienvenida y visión Scalexone',
    descripcion: 'Qué es, para qué sirve, cómo puede transformar tu vida/proyecto.',
    icono: '🚀',
  },
  {
    titulo: 'Mentalidad de crecimiento y futuro exponencial',
    descripcion: 'Cómo prepararte para aprovechar la IA y la automatización.',
    icono: '🧠',
  },
  {
    titulo: 'Navegación y uso de la plataforma',
    descripcion: 'Tutorial práctico de todas las secciones y herramientas.',
    icono: '🧭',
  },
  {
    titulo: 'Herramientas de IA y automatización',
    descripcion: 'Qué puedes hacer, ejemplos prácticos y casos de uso.',
    icono: '🤖',
  },
  {
    titulo: 'Construcción y escalado de comunidades',
    descripcion: 'Estrategias, recursos y cómo usar Scalexone para crecer tu audiencia.',
    icono: '🌐',
  },
  {
    titulo: 'Marca personal y monetización',
    descripcion: 'Cómo posicionarte, vender y diferenciarte usando la plataforma.',
    icono: '💼',
  },
  {
    titulo: 'Integración de IA en tu día a día',
    descripcion: 'Automatiza tareas, crea contenido, analiza datos y más.',
    icono: '⚡',
  },
  {
    titulo: 'Recursos, soporte y comunidad',
    descripcion: 'Dónde encontrar ayuda, networking y oportunidades de colaboración.',
    icono: '🤝',
  },
  {
    titulo: 'Plan de acción y próximos pasos',
    descripcion: 'Cómo avanzar, retos, certificaciones y cómo escalar tu impacto.',
    icono: '🏆',
  },
];

const Classroom = () => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar admin (puedes mejorar esto según tu auth real)
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    // Aquí deberías traer los módulos desde Supabase, pero si no hay, usar los de modelo
    const fetchModulos = async () => {
      const { data, error } = await supabase.from('classroom_modulos').select('*').order('orden');
      if (data && data.length > 0) setModulos(data as Modulo[]);
      else setModulos(MODULOS_MODELO);
    };
    fetchModulos();
  }, []);

  const handleEditar = (modulo: any) => {
    // Lógica para editar módulo (abrir modal, etc.)
  };
  const handleEliminar = (modulo: any) => {
    // Lógica para eliminar módulo (confirmación y borrado en Supabase)
  };
  const handlePersonalizar = (modulo: any) => {
    // Lógica para personalizar módulo (orden, icono, etc.)
  };
  const handleAgregar = () => {
    // Lógica para agregar nuevo módulo
  };
  const handleReordenar = (result: any) => {
    // Lógica para drag & drop (solo admin)
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">Classroom de Inducción</h1>
        {isAdmin && (
          <button onClick={handleAgregar} className="bg-cyan-400 text-black px-4 py-2 rounded font-bold hover:bg-cyan-300 transition">Agregar módulo</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {modulos.map((mod, idx) => (
          <div key={mod.id || idx} className="bg-black/80 border-2 border-cyan-400 rounded-2xl p-6 shadow-xl flex flex-col relative group">
            <div className="text-5xl mb-2">{mod.icono}</div>
            <h2 className="text-2xl font-bold mb-2">{mod.titulo}</h2>
            <p className="mb-4 text-cyan-100">{mod.descripcion}</p>
            {/* Barra de progreso (placeholder) */}
            <div className="w-full h-2 bg-cyan-900 rounded mb-4">
              <div className="h-2 bg-cyan-400 rounded" style={{ width: '0%' }}></div>
            </div>
            <button onClick={() => navigate(`/classroom/modulo/${mod.id || idx}`)} className="bg-cyan-400 text-black font-bold py-2 rounded-full transition-all hover:bg-cyan-300">Entrar</button>
            {isAdmin && (
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => handleEditar(mod)} className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">Editar</button>
                <button onClick={() => handleEliminar(mod)} className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">Eliminar</button>
                <button onClick={() => handlePersonalizar(mod)} className="bg-cyan-700 text-white px-2 py-1 rounded text-xs font-bold">Personalizar</button>
              </div>
            )}
            {/* Drag handle para admin (placeholder visual) */}
            {isAdmin && <div className="absolute left-2 top-2 cursor-move text-cyan-400">☰</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classroom; 