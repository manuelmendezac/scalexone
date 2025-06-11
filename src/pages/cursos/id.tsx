import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';
import { BookOpen, Users, Award } from 'lucide-react';

const mockCurso = {
  id: 1,
  titulo: 'Traffic Master',
  descripcion: 'Tu puerta de entrada a las estrategias de tráfico pago. Aprende a lanzar campañas, crear tu agencia y dominar el marketing digital.',
  imagen: '/img/traffic-master.jpg',
  modulos: [
    {
      titulo: '1. Bienvenido a Traffic Master',
      descripcion: '¡Felicidades! Esta es tu puerta de entrada para entrenarte como Traffic Master...',
      nivel: 'Junior',
      clases: 2,
    },
    {
      titulo: '2. Los primeros pasos del Traffic Master',
      descripcion: 'Es momento de conocer con claridad lo que hace un Traffic Master...',
      nivel: 'Junior',
      clases: 4,
    },
    {
      titulo: '3. Conozcamos la habilidad',
      descripcion: 'La habilidad del tráfico pago es una subdivisión del marketing digital...',
      nivel: 'Junior',
      clases: 4,
    },
  ],
  complementario: [
    { nombre: 'Zully Nathalia Mora', curso: 'Lamparas 3D', imagen: '/img/zully.jpg' },
    { nombre: 'Raul Huaman', curso: 'Curso de Sanación Familiar', imagen: '/img/raul.jpg' },
  ],
  comunidad: {
    titulo: 'Comunidad',
    descripcion: '¿Qué hay de nuevo en tu comunidad?',
    links: [
      { texto: 'Ver Master Adventure', color: 'red' },
      { texto: 'Grupo de anuncios', color: 'green' },
      { texto: 'Comunidad de Facebook', color: 'blue' },
    ],
  },
  eventos: [
    { titulo: 'Cafecito con Mike', dia: 'Lunes', hora: '6:30pm', plataforma: 'Zoom' },
    { titulo: 'Preguntas y Respuestas Tráfico Pago', dia: 'Jueves', hora: '6:00pm', plataforma: 'Google Meet' },
  ],
  certificacion: {
    titulo: 'Obtén tu Certificado',
    boton: 'Solicitar',
  },
};

const PortadaCursoEditor = ({ cursoId, portada, onSave }: any) => {
  const [form, setForm] = useState(portada || {
    logo_url: '', imagen_lateral_url: '', titulo: '', descripcion: '', calificacion: 5, num_calificaciones: 0, video_url: '', botones: [], boton_principal_texto: 'Iniciar', boton_principal_url: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    let res;
    if (portada && portada.id) {
      res = await supabase.from('cursos_portada').update(form).eq('id', portada.id);
    } else {
      res = await supabase.from('cursos_portada').insert([{ ...form, curso_id: cursoId }]);
    }
    setSaving(false);
    if (!res.error) onSave();
  };

  return (
    <div className="bg-neutral-900 p-4 rounded-xl mb-6">
      <h3 className="text-lg font-bold mb-2 text-cyan-400">Editar portada del curso</h3>
      <div className="flex flex-col gap-2">
        <input name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="URL del logo" className="p-2 rounded bg-neutral-800" />
        <input name="imagen_lateral_url" value={form.imagen_lateral_url} onChange={handleChange} placeholder="URL imagen lateral" className="p-2 rounded bg-neutral-800" />
        <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" className="p-2 rounded bg-neutral-800" />
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="p-2 rounded bg-neutral-800" />
        <input name="calificacion" type="number" step="0.1" value={form.calificacion} onChange={handleChange} placeholder="Calificación" className="p-2 rounded bg-neutral-800" />
        <input name="num_calificaciones" type="number" value={form.num_calificaciones} onChange={handleChange} placeholder="N° calificaciones" className="p-2 rounded bg-neutral-800" />
        <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="URL video (opcional)" className="p-2 rounded bg-neutral-800" />
        <input name="boton_principal_texto" value={form.boton_principal_texto} onChange={handleChange} placeholder="Texto botón principal" className="p-2 rounded bg-neutral-800" />
        <input name="boton_principal_url" value={form.boton_principal_url} onChange={handleChange} placeholder="URL botón principal" className="p-2 rounded bg-neutral-800" />
        <button onClick={handleSave} className="bg-cyan-500 text-white px-4 py-2 rounded mt-2" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
      </div>
    </div>
  );
};

const CursoDetalle = () => {
  const { id } = useParams();
  const { userInfo } = useNeuroState();
  const [portada, setPortada] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Buscar por email, que es único
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('email', user.email)
        .single();
      if (usuarioData?.rol === 'admin') setIsAdmin(true);
      else setIsAdmin(false);
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    async function fetchPortada() {
      setLoading(true);
      const { data } = await supabase.from('cursos_portada').select('*').eq('curso_id', id).single();
      setPortada(data);
      setLoading(false);
    }
    fetchPortada();
  }, [id]);

  const handleReload = () => {
    setLoading(true);
    supabase.from('cursos_portada').select('*').eq('curso_id', id).single().then(({ data }) => {
      setPortada(data);
      setLoading(false);
    });
  };

  // Datos demo si no hay portada
  const demo = {
    logo_url: '/logo-demo.png',
    imagen_lateral_url: '/img/traffic-master.jpg',
    titulo: 'Traffic Master',
    descripcion: 'Tu puerta de entrada a las estrategias de tráfico pago. Aprende a lanzar campañas, crear tu agencia y dominar el marketing digital.',
    calificacion: 4.9,
    num_calificaciones: 1614,
    video_url: '',
    boton_principal_texto: 'Iniciar',
    boton_principal_url: '#',
    botones: [
      { texto: 'Módulos', url: '#' },
      { texto: 'Complementario', url: '#' },
      { texto: 'Gamificación Scalexone', url: '#', editable: true },
    ],
  };
  const data = portada || demo;

  return (
    <div className="curso-detalle-page bg-black min-h-screen text-white p-0">
      {/* Portada visual estilo Bemaster */}
      <section className="w-full flex flex-col items-center justify-center pt-10 pb-8 px-2 md:px-0" style={{background: '#000'}}>
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
          {/* Logo grande a la izquierda */}
          <div className="flex-shrink-0 flex flex-col items-start w-full md:w-auto">
            <img src={data.logo_url} alt="Logo" className="h-16 md:h-20 w-auto mb-4 md:mb-0" />
          </div>
          {/* Botones pill con iconos a la derecha del logo */}
          <div className="flex flex-row gap-4 flex-wrap items-center ml-0 md:ml-4">
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-neutral-900 text-cyan-400 font-semibold text-base shadow border border-cyan-700"><BookOpen className="w-5 h-5"/>Módulos</button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-neutral-900 text-cyan-400 font-semibold text-base shadow border border-cyan-700"><Users className="w-5 h-5"/>Complementario</button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-neutral-900 text-cyan-400 font-semibold text-base shadow border border-cyan-700"><Award className="w-5 h-5"/>Master Adventure</button>
          </div>
        </div>
        {/* Título, descripción, calificación y botón principal */}
        <div className="w-full max-w-5xl mt-8 flex flex-col items-start">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cyan-400" style={{letterSpacing: '-1px'}}>{data.titulo}</h1>
          <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl">{data.descripcion}</p>
          <div className="flex flex-row items-center gap-4 mb-6">
            <span className="text-cyan-400 text-2xl font-bold">{'★'.repeat(Math.round(data.calificacion))}</span>
            <span className="text-white text-lg">{data.calificacion}/5 - {data.num_calificaciones} Calificaciones</span>
          </div>
          <a href={data.boton_principal_url || '#'} className="bg-cyan-400 hover:bg-cyan-300 text-black px-8 py-3 rounded-full font-bold text-lg shadow transition-all">{data.boton_principal_texto}</a>
        </div>
      </section>
      {/* Editor solo para admin */}
      {isAdmin && <PortadaCursoEditor cursoId={id} portada={portada} onSave={handleReload} />}

      {/* Módulos */}
      <section className="modulos mb-10">
        <h2 className="text-2xl font-bold mb-4">Módulos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {mockCurso.modulos.map((mod, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-2">{mod.titulo}</h3>
              <p className="mb-2">{mod.descripcion}</p>
              <div className="flex items-center gap-4 text-sm mb-2">
                <span>🧱 Nivel: {mod.nivel}</span>
                <span>▶️ Clases: {mod.clases}</span>
              </div>
              <button className="bg-white text-black px-4 py-1 rounded-full font-semibold">Iniciar</button>
            </div>
          ))}
        </div>
      </section>

      {/* Complementario */}
      <section className="complementario mb-10">
        <h2 className="text-2xl font-bold mb-4">Complementario</h2>
        <div className="flex gap-6 overflow-x-auto">
          {mockCurso.complementario.map((comp, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-xl p-4 min-w-[200px] flex flex-col items-center">
              <img src={comp.imagen} alt={comp.nombre} className="w-24 h-24 object-cover rounded-full mb-2" />
              <div className="text-center">
                <div className="font-bold">{comp.nombre}</div>
                <div className="text-sm">{comp.curso}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comunidad */}
      <section className="comunidad mb-10">
        <h2 className="text-2xl font-bold mb-4">{mockCurso.comunidad.titulo}</h2>
        <p className="mb-4">{mockCurso.comunidad.descripcion}</p>
        <div className="flex gap-4">
          {mockCurso.comunidad.links.map((link, idx) => (
            <button key={idx} className={`px-4 py-2 rounded-full font-semibold text-white bg-${link.color}-500`}>{link.texto}</button>
          ))}
        </div>
      </section>

      {/* Eventos */}
      <section className="eventos mb-10">
        <h2 className="text-2xl font-bold mb-4">Eventos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {mockCurso.eventos.map((ev, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-xl p-6 flex flex-col gap-2">
              <div className="font-bold text-lg">{ev.titulo}</div>
              <div>{ev.dia} {ev.hora} - {ev.plataforma}</div>
              <button className="bg-white text-black px-4 py-1 rounded-full font-semibold">Unirse</button>
            </div>
          ))}
        </div>
      </section>

      {/* Certificación */}
      <section className="certificacion mb-10">
        <h2 className="text-2xl font-bold mb-4">{mockCurso.certificacion.titulo}</h2>
        <button className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold">{mockCurso.certificacion.boton}</button>
      </section>
    </div>
  );
};

export default CursoDetalle; 