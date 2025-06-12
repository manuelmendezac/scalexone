import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';
import { BookOpen, Users, Award, UploadCloud, Layers, PlayCircle } from 'lucide-react';

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPortada, setUploadingPortada] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Subir imagen a Supabase Storage
  const handleUpload = async (e: any, field: 'logo_url' | 'imagen_lateral_url') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (field === 'logo_url') setUploadingLogo(true);
    if (field === 'imagen_lateral_url') setUploadingPortada(true);
    const ext = file.name.split('.').pop();
    const fileName = `${field}_${cursoId}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('cursos').upload(fileName, file, { upsert: true });
    if (error) {
      alert('Error al subir la imagen: ' + error.message);
      setUploadingLogo(false); setUploadingPortada(false);
      return;
    }
    const { data } = supabase.storage.from('cursos').getPublicUrl(fileName);
    if (data?.publicUrl) {
      setForm((f: typeof form) => ({ ...f, [field]: data.publicUrl }));
    }
    setUploadingLogo(false); setUploadingPortada(false);
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
    <div className="bg-neutral-900 p-4 rounded-xl mb-6 max-w-3xl mx-auto">
      <h3 className="text-lg font-bold mb-2 text-cyan-400">Editar portada del curso</h3>
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <label className="font-semibold text-cyan-300">Logo (sugerido 300x80px, PNG/SVG)</label>
        <div className="flex gap-2 items-center">
          <input name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="URL del logo" className="p-2 rounded bg-neutral-800 flex-1" />
          <label className="cursor-pointer flex items-center gap-1 bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-2 rounded shadow text-xs">
            <UploadCloud className="w-4 h-4" /> Subir
            <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'logo_url')} disabled={uploadingLogo} />
          </label>
        </div>
        {uploadingLogo && <span className="text-xs text-cyan-400">Subiendo logo...</span>}
        {/* Imagen lateral/portada */}
        <label className="font-semibold text-cyan-300 mt-2">Imagen de portada (sugerido 1200x600px, JPG/PNG)</label>
        <div className="flex gap-2 items-center">
          <input name="imagen_lateral_url" value={form.imagen_lateral_url} onChange={handleChange} placeholder="URL imagen lateral" className="p-2 rounded bg-neutral-800 flex-1" />
          <label className="cursor-pointer flex items-center gap-1 bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-2 rounded shadow text-xs">
            <UploadCloud className="w-4 h-4" /> Subir
            <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'imagen_lateral_url')} disabled={uploadingPortada} />
          </label>
        </div>
        {uploadingPortada && <span className="text-xs text-cyan-400">Subiendo imagen de portada...</span>}
        {/* Resto de campos */}
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
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem('adminMode') === 'true');
    }
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
      {/* Editor solo para admin, siempre visible arriba */}
      {isAdmin && <div className="max-w-5xl mx-auto pt-4"><PortadaCursoEditor cursoId={id} portada={portada} onSave={handleReload} /></div>}
      {/* Portada visual con mockup grande y botones mejorados */}
      <section className="w-full flex flex-col items-center justify-center pt-10 pb-8 px-2 md:px-0">
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-16">
          {/* Mockup (imagen de portada) grande, alineado centro, solo sombra */}
          <div className="order-1 md:order-2 w-full md:w-1/2 flex justify-center md:justify-end mb-6 md:mb-0">
            {data.imagen_lateral_url && (
              <img
                src={data.imagen_lateral_url}
                alt="Mockup"
                className="w-80 md:w-[420px] h-auto rounded-2xl shadow-2xl object-contain bg-black"
                style={{maxHeight: '400px', boxShadow: '0 8px 32px 0 rgba(0,255,255,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.25)'}}
              />
            )}
          </div>
          {/* Contenido principal */}
          <div className="order-2 md:order-1 w-full md:w-1/2 flex flex-col items-start">
            {/* Logo pequeño */}
            <img src={data.logo_url} alt="Logo" className="h-10 w-auto mb-4" style={{maxWidth: '110px'}} />
            <div className="flex flex-row gap-3 flex-wrap items-center mb-7 ml-1">
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-cyan-400 text-cyan-400 font-semibold text-sm shadow-none bg-black hover:bg-cyan-900/10 transition-all"><BookOpen className="w-4 h-4"/>Módulos</button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-cyan-400 text-cyan-400 font-semibold text-sm shadow-none bg-black hover:bg-cyan-900/10 transition-all"><Users className="w-4 h-4"/>Complementario</button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-cyan-400 text-cyan-400 font-semibold text-sm shadow-none bg-black hover:bg-cyan-900/10 transition-all"><Award className="w-4 h-4"/>Master Adventure</button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-cyan-400" style={{letterSpacing: '-1px'}}>{data.titulo}</h1>
            <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl">{data.descripcion}</p>
            <div className="flex flex-row items-center gap-4 mb-7">
              <span className="text-cyan-400 text-3xl font-bold">{'★'.repeat(Math.round(data.calificacion))}</span>
              <span className="text-white text-lg">{data.calificacion}/5 - {data.num_calificaciones} Calificaciones</span>
            </div>
            <a href={data.boton_principal_url || '#'} className="bg-cyan-400 hover:bg-cyan-300 text-black px-8 py-3 rounded-full font-bold text-lg shadow transition-all">{data.boton_principal_texto}</a>
          </div>
        </div>
        {/* Responsive: en móvil el mockup va arriba */}
        <style>{`
          @media (max-width: 768px) {
            .curso-detalle-page section > div { flex-direction: column !important; }
            .curso-detalle-page .order-1 { order: 1 !important; }
            .curso-detalle-page .order-2 { order: 2 !important; }
            .curso-detalle-page img[alt='Mockup'] { margin-bottom: 1.5rem; margin-top: 0; }
          }
        `}</style>
      </section>

      {/* Módulos */}
      <section className="modulos mb-10 px-4 md:px-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Módulos</h2>
          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400 text-cyan-400 font-semibold text-base bg-black hover:bg-cyan-400 hover:text-black transition-all shadow-none">
            Ver Todos <span className="text-xl font-bold transition-transform group-hover:translate-x-1">&gt;</span>
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {mockCurso.modulos.map((mod, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-2xl p-7 shadow-xl border border-neutral-800 flex flex-col h-full transition-all hover:shadow-2xl hover:border-cyan-400 group">
              {/* Icono grande arriba */}
              <div className="flex justify-center mb-4">
                {/* Puedes cambiar el icono por módulo después */}
                {idx === 0 && <svg width="48" height="48" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="24" cy="24" r="20" /><path d="M34 34L28 28" /><circle cx="24" cy="24" r="8" /></svg>}
                {idx === 1 && <svg width="48" height="48" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><rect x="8" y="16" width="32" height="16" rx="4" /><path d="M16 24h16" /></svg>}
                {idx === 2 && <svg width="48" height="48" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M24 8v8M24 32v8M8 24h8M32 24h8M16.24 16.24l5.66 5.66M32.97 32.97l-5.66-5.66" /></svg>}
              </div>
              {/* Título */}
              <h3 className="text-xl font-bold mb-2 text-cyan-200 group-hover:text-cyan-400 transition-all">{mod.titulo}</h3>
              {/* Descripción */}
              <p className="mb-4 text-white/90 text-sm min-h-[60px]">{mod.descripcion}</p>
              {/* Info fila */}
              <div className="flex flex-row items-center gap-4 text-cyan-300 mb-5">
                <span className="flex items-center gap-1 text-xs"><Layers className="w-4 h-4"/>Nivel: {mod.nivel}</span>
                <span className="flex items-center gap-1 text-xs"><PlayCircle className="w-4 h-4"/>Clases: {mod.clases}</span>
              </div>
              {/* Botones */}
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-white text-black font-bold py-2 rounded-full transition-all text-sm shadow group-hover:scale-105 border border-white hover:bg-cyan-400 hover:text-black hover:border-cyan-400">Iniciar</button>
                <button className="flex-1 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold py-2 rounded-full transition-all text-sm shadow group-hover:scale-105 flex items-center justify-center gap-1 bg-black">Ver clases <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h8m0 0-3-3m3 3-3 3"/></svg></button>
              </div>
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