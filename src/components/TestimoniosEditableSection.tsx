import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface Testimonio {
  nombre: string;
  cargo: string;
  foto_url: string;
  texto: string;
}

interface TestimoniosDatos {
  testimonios: Testimonio[];
}

interface Props {
  producto: any;
  onUpdate?: (nuevosDatos: TestimoniosDatos) => void;
  isAdmin?: boolean;
}

const defaultData: TestimoniosDatos = {
  testimonios: [
    {
      nombre: 'Ana de Armas',
      cargo: 'CEO, Startup Innovadora',
      foto_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      texto: 'Este es el mejor producto que he comprado. Cambió completamente mi forma de trabajar y los resultados han sido increíbles. 100% recomendado.'
    },
    {
      nombre: 'Carlos Pérez',
      cargo: 'Desarrollador Freelance',
      foto_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
      texto: 'Dudaba al principio, pero superó todas mis expectativas. El soporte es fantástico y el contenido es de primer nivel. ¡Gracias!'
    },
    {
      nombre: 'Sofía Rodríguez',
      cargo: 'Manager de Marketing',
      foto_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
      texto: 'Una inversión que se paga sola. Simple, directo al grano y con un impacto medible en mi negocio. No podría estar más contento.'
    }
  ]
};

export default function TestimoniosEditableSection({ producto, onUpdate, isAdmin }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TestimoniosDatos>(
    producto.testimonios_datos || defaultData
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  const handleTestimonioChange = (idx: number, field: keyof Testimonio, value: string) => {
    setForm(f => ({
      ...f,
      testimonios: f.testimonios.map((t, i) => i === idx ? { ...t, [field]: value } : t)
    }));
  };

  const handleAddTestimonio = () => {
    if (form.testimonios.length < 6) {
      setForm(f => ({
        ...f,
        testimonios: [...f.testimonios, {
          nombre: '',
          cargo: '',
          foto_url: '',
          texto: ''
        }]
      }));
    }
  };

  const handleRemoveTestimonio = (idx: number) => {
    if (form.testimonios.length > 1) {
      setForm(f => ({
        ...f,
        testimonios: f.testimonios.filter((_, i) => i !== idx)
      }));
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(idx);
    const ext = file.name.split('.').pop();
    const filePath = `testimonios/${producto.id}/foto_${idx}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('cursos-marketplace').upload(filePath, file, { upsert: true, contentType: file.type });
    setUploading(null);
    if (!error) {
      const url = supabase.storage.from('cursos-marketplace').getPublicUrl(filePath).data.publicUrl;
      setForm(f => ({
        ...f,
        testimonios: f.testimonios.map((t, i) => i === idx ? { ...t, foto_url: url } : t)
      }));
    } else {
      alert('Error subiendo foto: ' + error.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Detectar si es curso o servicio
    const tabla = producto.tipo_pago && producto.categoria && producto.categoria.toLowerCase().includes('servicio') ? 'servicios_marketplace' : 'cursos_marketplace';
    const { error } = await supabase
      .from(tabla)
      .update({ testimonios_datos: form })
      .eq('id', producto.id);
    setSaving(false);
    if (!error) {
      onUpdate && onUpdate(form);
      setModalOpen(false);
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  return (
    <div className="bg-black py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center relative">
          {isAdmin && (
            <button
              className="absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10 hover:bg-blue-700 transition-all"
              style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setModalOpen(true)}
            >
              <Edit size={20} />
            </button>
          )}
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Lo que dicen nuestros clientes</h2>
          <p className="mt-4 text-lg text-gray-400">Únete a cientos de traders que han transformado su operativa.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {form.testimonios.map((t, idx) => (
            <div key={idx} className="bg-gray-900/50 p-6 rounded-lg shadow-lg flex flex-col items-center">
              <p className="text-gray-300 mb-4">"{t.texto}"</p>
              <div className="mt-4 flex items-center gap-4">
                <img className="w-12 h-12 rounded-full object-cover" src={t.foto_url || 'https://i.pravatar.cc/150?img=1'} alt={t.nombre} />
                <div>
                  <p className="font-semibold text-white">{t.nombre}</p>
                  <p className="text-sm text-gray-500">{t.cargo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Editar testimonios</h3>
            <div className="space-y-8">
              {form.testimonios.map((t, idx) => (
                <div key={idx} className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-md font-semibold text-white">Testimonio {idx + 1}</h5>
                    {form.testimonios.length > 1 && (
                      <button onClick={() => handleRemoveTestimonio(idx)} className="bg-red-600 text-white p-1 rounded hover:bg-red-700"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Nombre:</label>
                      <input type="text" value={t.nombre} onChange={e => handleTestimonioChange(idx, 'nombre', e.target.value)} className="w-full p-2 rounded text-gray-200 bg-gray-700" />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Cargo:</label>
                      <input type="text" value={t.cargo} onChange={e => handleTestimonioChange(idx, 'cargo', e.target.value)} className="w-full p-2 rounded text-gray-200 bg-gray-700" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Foto:</label>
                    <input type="file" accept="image/*" onChange={e => handleFotoUpload(e, idx)} className="mb-2" />
                    {uploading === idx && <span className="text-blue-400">Subiendo...</span>}
                    {t.foto_url && <img src={t.foto_url} alt="foto" className="h-12 w-12 object-cover rounded-full mb-2" />}
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Texto:</label>
                    <textarea value={t.texto} onChange={e => handleTestimonioChange(idx, 'texto', e.target.value)} className="w-full p-2 rounded text-gray-200 bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleAddTestimonio} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 mt-6"><Plus size={16} />Agregar Testimonio</button>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSave} disabled={saving} className="bg-green-500 text-black px-4 py-2 rounded font-bold">{saving ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setModalOpen(false)} className="bg-gray-700 text-white px-4 py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 