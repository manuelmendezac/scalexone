import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import { Edit } from 'lucide-react';

interface BloqueIncluye {
  icono_url: string;
  titulo: string;
  descripcion: string;
  bullets: string[];
}

interface IncluyeAccesoDatos {
  titulo_principal: string;
  subtitulo: string;
  bloques: BloqueIncluye[];
}

interface Props {
  producto: any;
  onUpdate?: (nuevosDatos: IncluyeAccesoDatos) => void;
}

const bloquesDefault: BloqueIncluye[] = [
  {
    icono_url: '',
    titulo: 'Sesiones de Trading en Vivo',
    descripcion: '',
    bullets: [
      'Operaciones en tiempo real con VicForex.',
      'Análisis, entradas, gestión del riesgo y cierre en vivo.',
      'Espacios interactivos para resolver dudas.',
      'Acceso a grabaciones 24/7.'
    ]
  },
  {
    icono_url: '',
    titulo: 'Bonos Vicforex',
    descripcion: '',
    bullets: [
      'Curso Fundamentos de Trading.',
      'Curso Trading sistemático.',
      'Checklists, herramientas y plantillas descargables.'
    ]
  },
  {
    icono_url: '',
    titulo: 'Alertas en Tiempo Real',
    descripcion: '',
    bullets: [
      'Canal privado (Telegram o Discord).',
      'Alertas de setups, noticias clave y oportunidades de entrada.'
    ]
  },
  {
    icono_url: '',
    titulo: 'Comunidad Global de Traders',
    descripcion: '',
    bullets: [
      'LATAM, USA, Europa y Asia.',
      'Comparte, aprende y crece con una red activa y profesional.'
    ]
  },
  {
    icono_url: '',
    titulo: 'Bonos Premium',
    descripcion: '(Máximo 10)',
    bullets: [
      'Acceso gratuito al sistema de copytrading.',
      'Sorteo de cuentas de $1000 dólares cada mes.',
      'Mentoría Dubai Trading Society.'
    ]
  }
];

const defaultData: IncluyeAccesoDatos = {
  titulo_principal: '¿QUÉ INCLUYE TU ACCESO?',
  subtitulo: 'Accede a una comunidad donde aprender, operar y crecer es parte del día a día.',
  bloques: bloquesDefault
};

export default function IncluyeAccesoEditableSection({ producto, onUpdate }: Props) {
  const { isAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<IncluyeAccesoDatos>(
    producto.incluye_acceso_datos || defaultData
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  // Subida de imagen/icono
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(idx);
    let uploadFile = file;
    let ext = file.name.split('.').pop()?.toLowerCase() || '';
    // Si es SVG, súbelo tal cual, sin conversión ni procesamiento
    if (file.type === 'image/svg+xml' || ext === 'svg') {
      // No conversion, keep as is
    } else if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
      try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(bitmap, 0, 0);
        const blob = await new Promise<Blob | null>(resolve =>
          canvas.toBlob(resolve, 'image/webp', 0.92)
        );
        if (blob) {
          uploadFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
          ext = 'webp';
        }
      } catch (err) {
        // Si falla, sube el original
      }
    }
    // Detectar bucket según tipo de producto
    let bucket = 'cursos-marketplace';
    if (producto.tipo_pago && producto.tipo_pago === 'suscripcion' && producto.categoria && producto.categoria.toLowerCase().includes('servicio')) {
      bucket = 'servicios-marketplace';
    }
    const filePath = `incluye-acceso/${producto.id}/icono_${idx}_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, uploadFile, { upsert: true, contentType: file.type });
    setUploading(null);
    if (!error) {
      const url = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
      setForm(f => ({
        ...f,
        bloques: f.bloques.map((b, i) => i === idx ? { ...b, icono_url: url } : b)
      }));
    } else {
      alert('Error subiendo icono: ' + error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleBloqueChange = (idx: number, key: keyof BloqueIncluye, value: string | string[]) => {
    setForm(f => ({
      ...f,
      bloques: f.bloques.map((b, i) => i === idx ? { ...b, [key]: value } : b)
    }));
  };

  const handleBulletChange = (idx: number, bulletIdx: number, value: string) => {
    setForm(f => ({
      ...f,
      bloques: f.bloques.map((b, i) =>
        i === idx ? { ...b, bullets: b.bullets.map((bl, j) => j === bulletIdx ? value : bl) } : b
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('cursos_marketplace') // o servicios_marketplace según corresponda
      .update({ incluye_acceso_datos: form })
      .eq('id', producto.id);
    setSaving(false);
    if (!error) {
      onUpdate && onUpdate(form);
      setModalOpen(false);
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  // Agregar bloque vacío
  const handleAddBloque = () => {
    setForm(f => ({
      ...f,
      bloques: [
        ...f.bloques,
        { icono_url: '', titulo: '', descripcion: '', bullets: [''] }
      ]
    }));
  };

  // Eliminar bloque
  const handleRemoveBloque = (idx: number) => {
    setForm(f => ({
      ...f,
      bloques: f.bloques.length > 1 ? f.bloques.filter((_, i) => i !== idx) : f.bloques
    }));
  };

  return (
    <div className="bg-black py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 relative">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">{form.titulo_principal}</h2>
          <p className="mt-4 text-lg text-gray-400">{form.subtitulo}</p>
          {isAdmin && (
            <button
              className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
              onClick={() => setModalOpen(true)}
            >
              <Edit size={18} className="inline mr-2" /> Editar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {form.bloques.map((bloque, idx) => (
            <div key={idx} className="bg-gray-900/70 p-8 rounded-2xl border border-blue-800/50 shadow-2xl flex flex-col h-full">
              <div className="flex justify-center mb-6 h-16 items-center">
                {bloque.icono_url ? (
                  <img src={bloque.icono_url} alt="icono" className="h-14 w-14 object-contain" />
                ) : (
                  <span className="h-14 w-14 bg-gray-700 rounded-full flex items-center justify-center text-gray-400">Icono</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">{bloque.titulo}</h3>
              <ul className="space-y-2 text-gray-400">
                {bloque.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3"><span className="text-yellow-400">✔</span><span>{b}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* Modal de edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Editar sección ¿QUÉ INCLUYE TU ACCESO?</h3>
            <label className="block text-gray-300 mb-2">Título principal:</label>
            <input type="text" name="titulo_principal" value={form.titulo_principal} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            <label className="block text-gray-300 mb-2">Subtítulo:</label>
            <input type="text" name="subtitulo" value={form.subtitulo} onChange={handleChange} className="w-full mb-4 p-2 rounded" />
            {form.bloques.map((bloque, idx) => (
              <div key={idx} className="mb-8 border-b border-gray-700 pb-4">
                <label className="block text-gray-300 mb-2">Icono/Imagen:</label>
                <input type="file" accept="image/*,.svg" onChange={e => handleIconUpload(e, idx)} className="mb-2" />
                {uploading === idx && <span className="text-blue-400">Subiendo...</span>}
                {bloque.icono_url && <img src={bloque.icono_url} alt="icono" className="h-12 w-12 object-contain mb-2" />}
                <label className="block text-gray-300 mb-2">Título del bloque:</label>
                <input type="text" value={bloque.titulo} onChange={e => handleBloqueChange(idx, 'titulo', e.target.value)} className="w-full mb-2 p-2 rounded" />
                <label className="block text-gray-300 mb-2">Bullets:</label>
                {bloque.bullets.map((b, i) => (
                  <input key={i} type="text" value={b} onChange={e => handleBulletChange(idx, i, e.target.value)} className="w-full mb-2 p-2 rounded" />
                ))}
                {form.bloques.length > 1 && (
                  <button type="button" onClick={() => handleRemoveBloque(idx)} className="mt-2 bg-red-600 text-white px-3 py-1 rounded">Eliminar bloque</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddBloque} className="bg-blue-700 text-white px-4 py-2 rounded font-bold mb-4">Agregar bloque</button>
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