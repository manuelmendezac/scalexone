import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import { Edit } from 'lucide-react';

function parseVideoUrl(url: string) {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtu\.be\/|youtube\.com.*(?:v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

interface HeroEditableSectionProps {
  producto: any;
  onUpdate?: (nuevosDatos: any) => void;
  isAdmin?: boolean;
}

const defaultBullets = [
  '¿Estás cansado de cursos teóricos que no llevan a ninguna parte?',
  '¿Quieres resultados reales y operar con un equipo profesional?',
  '¿Te gustaría aprender con respaldo global y acceso a capital?'
];

export default function HeroEditableSection({ producto, onUpdate, isAdmin }: HeroEditableSectionProps) {
  const { isAdmin: authIsAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    video_url: producto.portada_datos?.video_url || '',
    titulo: producto.portada_datos?.titulo || '',
    descripcion: producto.portada_datos?.descripcion || '',
    bullets: producto.portada_datos?.bullets || defaultBullets,
    cta_texto: producto.portada_datos?.cta_texto || 'Entonces esto es para ti',
    usuarios_activos: producto.portada_datos?.usuarios_activos || 300,
    rating: producto.portada_datos?.rating || 5,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleBulletChange = (i: number, value: string) => {
    setForm(f => ({ ...f, bullets: f.bullets.map((b, idx) => idx === i ? value : b) }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('cursos_marketplace') // o servicios_marketplace según corresponda
      .update({ portada_datos: form })
      .eq('id', producto.id);
    setSaving(false);
    if (!error) {
      onUpdate && onUpdate(form);
      setModalOpen(false);
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const videoEmbed = parseVideoUrl(form.video_url);

  // Nueva función para scroll al anclaje de membresías
  const handleScrollToMembresias = () => {
    const target = document.getElementById('membresias');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-black py-16">
      {isAdmin && (
        <button
          className="absolute top-4 right-4 z-20 bg-blue-600 text-white p-2 rounded-full flex items-center gap-2 hover:bg-blue-700"
          onClick={() => setModalOpen(true)}
        >
          <Edit size={20} /> Editar
        </button>
      )}
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 flex justify-center">
          {videoEmbed ? (
            <iframe
              src={videoEmbed}
              title="Video"
              className="rounded-lg w-full aspect-video"
              allowFullScreen
            />
          ) : (
            <div className="w-full aspect-video bg-gray-800 flex items-center justify-center text-white">Sin video</div>
          )}
        </div>
        <div className="w-full lg:w-1/2">
          <h2 className="text-4xl font-bold text-white flex items-center gap-4">
            {form.titulo}
            {producto.tipo_pago === 'suscripcion' && (
              <span className="bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full">Suscripción</span>
            )}
            {producto.tipo_pago === 'pago_unico' && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">Pago Único</span>
            )}
          </h2>
          <p className="text-gray-300 mt-4">{form.descripcion}</p>
          <ul className="mt-6 space-y-2">
            {form.bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-blue-400">
                ✓ <span className="text-white">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-4">
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
              onClick={handleScrollToMembresias}
            >
              {form.cta_texto}
            </button>
            <div className="flex items-center gap-1 text-yellow-400">
              {'★'.repeat(Number(form.rating))}
            </div>
            <span className="text-gray-400">+{form.usuarios_activos} usuarios activos</span>
          </div>
        </div>
      </div>
      {/* Modal de edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Editar sección HERO</h3>
            <label className="block text-gray-300 mb-2">URL Video (YouTube/Vimeo):</label>
            <input type="text" name="video_url" value={form.video_url} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            {parseVideoUrl(form.video_url) && (
              <iframe src={parseVideoUrl(form.video_url)} className="w-full aspect-video mb-4 rounded" allowFullScreen />
            )}
            <label className="block text-gray-300 mb-2">Título:</label>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            <label className="block text-gray-300 mb-2">Descripción:</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            <label className="block text-gray-300 mb-2">Bullets:</label>
            {form.bullets.map((b, i) => (
              <input key={i} type="text" value={b} onChange={e => handleBulletChange(i, e.target.value)} className="w-full mb-2 p-2 rounded" />
            ))}
            <label className="block text-gray-300 mb-2">Texto CTA:</label>
            <input type="text" name="cta_texto" value={form.cta_texto} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            <label className="block text-gray-300 mb-2">Usuarios activos:</label>
            <input type="number" name="usuarios_activos" value={form.usuarios_activos} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            <label className="block text-gray-300 mb-2">Rating (1-5):</label>
            <input type="number" name="rating" min={1} max={5} value={form.rating} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            <div className="flex gap-4 mt-4">
              <button onClick={handleSave} disabled={saving} className="bg-green-500 text-black px-4 py-2 rounded font-bold">{saving ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setModalOpen(false)} className="bg-gray-700 text-white px-4 py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 