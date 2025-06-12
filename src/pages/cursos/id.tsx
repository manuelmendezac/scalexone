import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';
import { BookOpen, Users, Award, UploadCloud, Layers, PlayCircle, X } from 'lucide-react';
import ModalFuturista from '../../components/ModalFuturista';
import CertificacionSection from '../../components/CertificacionSection';

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

// Componente de barra de progreso circular futurista
const CircularProgress = ({ percent = 0, size = 64, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="block relative z-10">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00fff7" />
            <stop offset="100%" stopColor="#7f5cff" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Fondo translúcido */}
        <circle cx={size/2} cy={size/2} r={r} stroke="#222a" strokeWidth={stroke} fill="rgba(20,20,30,0.7)" />
        {/* Progreso con gradiente y glow */}
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke="url(#grad1)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'url(#glow)' }}
        />
      </svg>
      {/* Porcentaje debajo */}
      <span className="text-cyan-300 font-bold text-sm mt-1 drop-shadow-glow">{percent}%</span>
    </div>
  );
};

const categoriasComplementario = [
  { key: 'Masterclass', label: 'Masterclass' },
  { key: 'Sesión en Vivo', label: 'Sesión en Vivo' },
  { key: 'Master Live', label: 'Master Live' },
];

type VideoComplementario = {
  id: string;
  curso_id: string;
  categoria: string;
  titulo: string;
  ponente: string;
  imagen: string;
  video_url: string;
  orden: number;
};

const CursoDetalle = () => {
  const { id } = useParams();
  const { userInfo } = useNeuroState();
  const [portada, setPortada] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editModuloIdx, setEditModuloIdx] = useState<number | null>(null);
  const [modulos, setModulos] = useState<any[]>(mockCurso.modulos);
  const [moduloForm, setModuloForm] = useState<any>({});
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [savingModulo, setSavingModulo] = useState(false);
  const [errorModulo, setErrorModulo] = useState<string | null>(null);
  const [editPortadaOpen, setEditPortadaOpen] = useState(false);
  const [videosComplementarios, setVideosComplementarios] = useState<VideoComplementario[]>([]);
  const [videoModal, setVideoModal] = useState<{ url: string, titulo: string } | null>(null);
  const [editVideo, setEditVideo] = useState<VideoComplementario | null>(null);
  const [editVideoForm, setEditVideoForm] = useState<any>({});
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [videoPage, setVideoPage] = useState<{[cat: string]: number}>({});

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
      let modArr = (data && data.modulos) ? data.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      setModulos(modArr.length > 0 ? modArr : mockCurso.modulos);
      setLoading(false);
    }
    fetchPortada();
  }, [id]);

  useEffect(() => {
    async function fetchVideos() {
      const { data } = await supabase
        .from('videos_complementarios')
        .select('*')
        .eq('curso_id', id)
        .order('categoria', { ascending: true })
        .order('orden', { ascending: true });
      setVideosComplementarios((data as VideoComplementario[]) || []);
    }
    if (id) fetchVideos();
  }, [id]);

  const handleReload = () => {
    setLoading(true);
    supabase.from('cursos_portada').select('*').eq('curso_id', id).single().then(({ data }) => {
      setPortada(data);
      let modArr = (data && data.modulos) ? data.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      setModulos(modArr.length > 0 ? modArr : mockCurso.modulos);
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
  };
  const data = portada || demo;

  const handleEditModulo = (idx: number) => {
    setEditModuloIdx(idx);
    setModuloForm(modulos[idx]);
  };
  const handleCloseModal = () => {
    setEditModuloIdx(null);
    setModuloForm({});
  };
  const handleModuloChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setModuloForm({ ...moduloForm, [e.target.name]: e.target.value });
  };
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingIcon(true);
    const ext = file.name.split('.').pop();
    const fileName = `modulo_icon_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('cursos').upload(fileName, file, { upsert: true });
    if (error) {
      alert('Error al subir icono: ' + error.message);
      setUploadingIcon(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('cursos').getPublicUrl(fileName);
    setModuloForm({ ...moduloForm, icono: publicUrlData?.publicUrl || '' });
    setUploadingIcon(false);
  };
  const handleSaveModulo = async () => {
    if (editModuloIdx === null) return;
    setSavingModulo(true);
    setErrorModulo(null);
    const nuevosModulos = [...modulos];
    nuevosModulos[editModuloIdx] = moduloForm;
    setModulos(nuevosModulos);
    // Persistir en Supabase
    if (portada && portada.id) {
      const { error } = await supabase.from('cursos_portada').update({ modulos: nuevosModulos }).eq('id', portada.id);
      if (error) {
        setErrorModulo('Error al guardar los cambios. Intenta de nuevo.');
        setSavingModulo(false);
        return;
      }
      await handleReload();
    }
    setEditModuloIdx(null);
    setModuloForm({});
    setSavingModulo(false);
  };

  const handleEditVideo = (video: VideoComplementario) => {
    setEditVideo(video);
    setEditVideoForm(video);
  };
  const handleEditVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditVideoForm({ ...editVideoForm, [e.target.name]: e.target.value });
  };
  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingThumb(true);
    const ext = file.name.split('.').pop();
    const fileName = `video_thumb_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('cursos').upload(fileName, file, { upsert: true });
    if (error) {
      alert('Error al subir miniatura: ' + error.message);
      setUploadingThumb(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('cursos').getPublicUrl(fileName);
    setEditVideoForm({ ...editVideoForm, imagen: publicUrlData?.publicUrl || '' });
    setUploadingThumb(false);
  };
  const handleSaveEditVideo = async () => {
    if (!editVideo) return;
    await supabase.from('videos_complementarios').update(editVideoForm).eq('id', editVideo.id);
    setEditVideo(null);
    setEditVideoForm({});
    // Recargar videos
    const { data } = await supabase
      .from('videos_complementarios')
      .select('*')
      .eq('curso_id', id)
      .order('categoria', { ascending: true })
      .order('orden', { ascending: true });
    setVideosComplementarios((data as VideoComplementario[]) || []);
  };

  const handleNextPage = (catKey: string, total: number) => {
    setVideoPage(prev => ({
      ...prev,
      [catKey]: Math.min((prev[catKey] || 0) + 1, Math.floor((total - 1) / 3))
    }));
  };
  const handlePrevPage = (catKey: string) => {
    setVideoPage(prev => ({
      ...prev,
      [catKey]: Math.max((prev[catKey] || 0) - 1, 0)
    }));
  };

  const handleDuplicateVideo = async (video: VideoComplementario) => {
    // Quitar id y poner orden al final
    const videosCat = videosComplementarios.filter(v => v.categoria === video.categoria);
    const maxOrden = videosCat.length > 0 ? Math.max(...videosCat.map(v => v.orden)) : 0;
    const { id: _omit, ...videoSinId } = video;
    const newVideo = {
      ...videoSinId,
      curso_id: id, // Aseguramos que el curso_id sea el actual
      orden: maxOrden + 1,
      categoria: video.categoria || '',
      titulo: video.titulo || '',
      ponente: video.ponente || '',
      imagen: video.imagen || '',
      video_url: video.video_url || ''
    };
    const { error } = await supabase.from('videos_complementarios').insert([newVideo]);
    if (error) {
      alert('Error al duplicar: ' + error.message);
      return;
    }
    // Recargar videos
    const { data } = await supabase
      .from('videos_complementarios')
      .select('*')
      .eq('curso_id', id)
      .order('categoria', { ascending: true })
      .order('orden', { ascending: true });
    setVideosComplementarios((data as VideoComplementario[]) || []);
  };

  return (
    <div className="curso-detalle-page bg-black min-h-screen text-white p-0">
      {/* Editor solo para admin, siempre visible arriba */}
      {isAdmin && (
        <div className="max-w-5xl mx-auto pt-4 flex justify-end">
          <button
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-full shadow transition"
            onClick={() => setEditPortadaOpen(true)}
          >
            Editar portada
          </button>
        </div>
      )}
      {/* Modal para editar portada */}
      <ModalFuturista open={editPortadaOpen} onClose={() => setEditPortadaOpen(false)}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',minHeight:'100vh',padding:'32px 0'}}>
          <div className="relative flex flex-col gap-4 p-6 min-w-[320px] max-w-[420px] w-full bg-neutral-900 rounded-xl" style={{maxWidth: 420, maxHeight: '95vh', overflowY: 'auto', paddingTop: 40, paddingBottom: 32}}>
            {/* Botón X de cerrar */}
            <button
              onClick={() => setEditPortadaOpen(false)}
              className="absolute top-3 right-3 text-cyan-400 hover:text-cyan-200 text-2xl z-20"
              aria-label="Cerrar"
              style={{background: 'none', border: 'none', cursor: 'pointer'}}
            >
              <X size={28} />
            </button>
            <PortadaCursoEditor cursoId={id} portada={portada} onSave={() => { handleReload(); setEditPortadaOpen(false); }} />
          </div>
        </div>
      </ModalFuturista>
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
          {modulos.map((mod, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-2xl p-7 shadow-xl border border-neutral-800 flex flex-col h-full transition-all hover:shadow-2xl hover:border-cyan-400 group">
              {/* Icono grande arriba */}
              <div className="flex flex-col items-center mb-4">
                <div className="flex flex-row items-center justify-center gap-6 w-full md:flex-row flex-col">
                  {/* Barra de progreso circular */}
                  <div className="flex flex-col items-center">
                    <CircularProgress percent={Math.floor(Math.random()*60+40)} />
                  </div>
                  {/* Icono grande, ajustado automáticamente */}
                  <div className="flex flex-col items-center">
                    {mod.icono ? (
                      <img src={mod.icono} alt="icono" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full bg-black/80" style={{minWidth: '64px', minHeight: '64px', maxWidth: '80px', maxHeight: '80px', border: 'none', boxShadow: 'none'}} />
                    ) : (
                      <svg width="64" height="64" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="32" cy="32" r="26" /><path d="M48 48L40 40" /><circle cx="32" cy="32" r="10" /></svg>
                    )}
                  </div>
                </div>
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
                {isAdmin && (
                  <button className="ml-2 px-3 py-1 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition" onClick={() => handleEditModulo(idx)}>Editar</button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Modal de edición de módulo */}
        <ModalFuturista open={editModuloIdx !== null} onClose={handleCloseModal}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',minHeight:'100vh'}}>
            <form className="flex flex-col gap-4 p-4 min-w-[320px] max-w-[420px] w-full" style={{maxWidth: 420, maxHeight: '90vh', overflowY: 'auto'}} onSubmit={async e => { e.preventDefault(); await handleSaveModulo(); }}>
              <div className="font-bold text-lg mb-2 text-cyan-400">Editar módulo</div>
              {savingModulo && <div className="text-cyan-400 text-center">Guardando cambios...</div>}
              {errorModulo && <div className="text-red-400 text-center">{errorModulo}</div>}
              <label className="text-cyan-300 font-semibold">Título</label>
              <input name="titulo" value={moduloForm.titulo || ''} onChange={handleModuloChange} className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" required />
              <label className="text-cyan-300 font-semibold">Descripción</label>
              <textarea name="descripcion" value={moduloForm.descripcion || ''} onChange={handleModuloChange} className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" rows={3} required />
              <label className="text-cyan-300 font-semibold">Nivel</label>
              <select name="nivel" value={moduloForm.nivel || ''} onChange={handleModuloChange} className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" required>
                <option value="">Selecciona el nivel</option>
                <option value="Junior">Junior</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
              <label className="text-cyan-300 font-semibold">Clases</label>
              <input name="clases" type="number" value={moduloForm.clases || ''} onChange={handleModuloChange} className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" required />
              <label className="text-cyan-300 font-semibold">Icono/Imagen</label>
              <input type="file" accept="image/*" onChange={handleIconUpload} />
              <span className="text-xs text-neutral-400 text-center">Sugerencia: Usa un icono cuadrado de 80x80px en PNG, JPG o SVG para mejor visualización.</span>
              {uploadingIcon && <span className="text-xs text-cyan-400">Subiendo icono...</span>}
              {moduloForm.icono && (
                <img src={moduloForm.icono} alt="icono" className="w-20 h-20 object-cover rounded-full mt-2" style={{border: 'none', boxShadow: 'none', background: '#111'}} />
              )}
              <div className="flex gap-2 mt-4 sticky bottom-0 bg-neutral-900 py-2 z-10">
                <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded transition">Guardar</button>
                <button type="button" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition" onClick={handleCloseModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </ModalFuturista>
      </section>

      {/* Complementario */}
      <section className="complementario mb-10">
        <h2 className="text-2xl font-bold mb-4">Complementario</h2>
        {categoriasComplementario.map(cat => {
          const videosCat = videosComplementarios.filter(v => v.categoria === cat.key);
          const page = videoPage[cat.key] || 0;
          const totalPages = Math.ceil(videosCat.length / 3);
          return (
            <div key={cat.key} className="mb-8">
              <h3 className="text-xl font-bold mb-3">{cat.label}</h3>
              <div className="flex items-center gap-2 mb-2">
                {totalPages > 1 && (
                  <>
                    <button onClick={() => handlePrevPage(cat.key)} disabled={page === 0} className="px-2 py-1 rounded-full bg-cyan-800 text-white disabled:opacity-40">◀</button>
                    <span className="text-cyan-300 text-xs">Página {page + 1} de {totalPages}</span>
                    <button onClick={() => handleNextPage(cat.key, videosCat.length)} disabled={page >= totalPages - 1} className="px-2 py-1 rounded-full bg-cyan-800 text-white disabled:opacity-40">▶</button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-6">
                {videosCat.slice(page * 3, page * 3 + 3).map((video, idx) => (
                  <div key={video.id} className="bg-neutral-900 rounded-xl p-0 overflow-hidden shadow-lg w-[340px] min-h-[210px] flex flex-col relative group">
                    <div className="relative w-full h-[170px] bg-black">
                      <img src={video.imagen} alt={video.titulo} className="w-full h-full object-cover" />
                      <button
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-full flex items-center gap-2 text-base shadow-lg z-10"
                        style={{minWidth: '110px'}}
                        onClick={() => setVideoModal({ url: video.video_url, titulo: video.titulo })}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6,4 20,11 6,18" fill="currentColor" /></svg>
                        Ver Ahora
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-green-400 text-xs font-bold mb-1">{cat.label}</div>
                        <div className="text-white font-bold text-base mb-1 leading-tight">{video.titulo}</div>
                        <div className="text-green-300 text-sm font-semibold">{video.ponente}</div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 mt-2">
                          <button className="text-xs text-cyan-400 underline" onClick={() => handleEditVideo(video)}>Editar</button>
                          <button className="text-xs text-yellow-400 underline" onClick={() => handleDuplicateVideo(video)}>Duplicar</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {/* Modal de video fullscreen */}
        <ModalFuturista open={!!videoModal} onClose={() => setVideoModal(null)}>
          {videoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
              <button
                onClick={() => setVideoModal(null)}
                className="absolute top-4 right-4 text-white text-2xl z-50 bg-black/60 rounded-full p-2 hover:bg-black/90"
                aria-label="Cerrar video"
              >×</button>
              <div className="w-full max-w-4xl aspect-video flex flex-col items-center justify-center">
                <iframe
                  src={videoModal.url.replace('watch?v=', 'embed/')}
                  title={videoModal.titulo}
                  className="w-full h-full rounded-xl"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </ModalFuturista>
        {/* Modal de edición de video */}
        <ModalFuturista open={!!editVideo} onClose={() => setEditVideo(null)}>
          {editVideo && (
            <form className="flex flex-col gap-4 p-6 min-w-[320px] max-w-[420px] w-full" style={{maxWidth: 420}} onSubmit={e => { e.preventDefault(); handleSaveEditVideo(); }}>
              <div className="font-bold text-lg mb-2 text-cyan-400">Editar video</div>
              <label className="text-cyan-300 font-semibold">Título</label>
              <input name="titulo" value={editVideoForm.titulo || ''} onChange={handleEditVideoChange} className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" required />
              <label className="text-cyan-300 font-semibold">Ponente</label>
              <input name="ponente" value={editVideoForm.ponente || ''} onChange={handleEditVideoChange} className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" required />
              <label className="text-cyan-300 font-semibold">Miniatura</label>
              <input type="file" accept="image/*" onChange={handleThumbUpload} />
              {uploadingThumb && <span className="text-xs text-cyan-400">Subiendo miniatura...</span>}
              {editVideoForm.imagen && (
                <img src={editVideoForm.imagen} alt="miniatura" className="w-32 h-20 object-cover rounded mt-2" />
              )}
              <label className="text-cyan-300 font-semibold">Enlace de video (YouTube, Vimeo, etc.)</label>
              <input name="video_url" value={editVideoForm.video_url || ''} onChange={handleEditVideoChange} className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" required />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded transition">Guardar</button>
                <button type="button" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition" onClick={() => setEditVideo(null)}>Cancelar</button>
              </div>
            </form>
          )}
        </ModalFuturista>
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
        <CertificacionSection
          videoUrl="https://www.youtube.com/embed/1Q8fG0TtVAY" // Ejemplo de video motivacional
          onCertificar={() => alert('Aquí irá la lógica para certificar o abrir el quiz')}
          certificadoImg="/img/certificado-demo.png"
          alianzas={[
            { logo: "/logos/cel.png", nombre: "Center of Education and Leadership", url: "https://cel.com" },
            { logo: "/logos/fguni.png", nombre: "Florida Global University", url: "https://floridaglobal.university" }
          ]}
        />
      </section>

      {/* Media query para apilar en móvil */}
      <style>{`
        @media (max-width: 600px) {
          .modulo-top-row { flex-direction: column !important; gap: 1.5rem !important; }
        }
      `}</style>

      {/* Loader visual general */}
      {loading && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="text-cyan-300 text-xl font-bold animate-pulse">Cargando...</div></div>}
    </div>
  );
};

export default CursoDetalle; 