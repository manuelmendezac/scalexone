import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Edit } from 'lucide-react';
import flagsList from '../utils/flagsList'; // Debes crear este archivo con [{code: 'mx', name: 'México', url: 'https://flagcdn.com/w20/mx.png'}, ...]

interface BloqueAutoridadDatos {
  avatar_url: string;
  nombre: string;
  especialidades: string;
  banderas: string[];
  estadisticas: {
    años_experiencia: string;
    paises: string;
    estudiantes: string;
    comunidad: string;
  };
  chips: string[];
}

interface Props {
  producto: any;
  onUpdate?: (nuevosDatos: BloqueAutoridadDatos) => void;
  isAdmin?: boolean;
}

const defaultData: BloqueAutoridadDatos = {
  avatar_url: '',
  nombre: 'VICTOR ACOSTA',
  especialidades: 'Trading · Análisis Técnico · Mentalidad',
  banderas: [
    'https://flagcdn.com/w20/mx.png',
    'https://flagcdn.com/w20/ar.png',
    'https://flagcdn.com/w20/pe.png',
    'https://flagcdn.com/w20/co.png',
    'https://flagcdn.com/w20/ve.png',
    'https://flagcdn.com/w20/cl.png',
    'https://flagcdn.com/w20/es.png'
  ],
  estadisticas: {
    años_experiencia: '4+',
    paises: '7+',
    estudiantes: '1,200+',
    comunidad: 'Activa'
  },
  chips: [
    'Acción del Precio',
    'Gestión de Riesgo',
    'Psicotrading',
    'Trading en Vivo'
  ]
};

export default function BloqueAutoridadEditableSection({ producto, onUpdate, isAdmin }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<BloqueAutoridadDatos>(
    producto.bloque_autoridad_datos || defaultData
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFlag, setUploadingFlag] = useState<number | null>(null);

  // Subida de avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    let uploadFile = file;
    // Convertir a webp si es png/jpg/jpeg
    if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
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
      } catch (err) {}
    }
    let bucket = 'cursos-marketplace';
    if (producto.tipo_pago && producto.tipo_pago === 'suscripcion' && producto.categoria && producto.categoria.toLowerCase().includes('servicio')) {
      bucket = 'servicios-marketplace';
    }
    const filePath = `bloque-autoridad/${producto.id}/avatar_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, uploadFile, { upsert: true, contentType: file.type });
    setUploading(false);
    if (!error) {
      const url = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
      setForm(f => ({ ...f, avatar_url: url }));
    } else {
      alert('Error subiendo avatar: ' + error.message);
    }
  };

  // Subida de bandera
  const handleFlagUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFlag(idx);
    let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    let uploadFile = file;
    if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
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
      } catch (err) {}
    }
    let bucket = 'cursos-marketplace';
    if (producto.tipo_pago && producto.tipo_pago === 'suscripcion' && producto.categoria && producto.categoria.toLowerCase().includes('servicio')) {
      bucket = 'servicios-marketplace';
    }
    const filePath = `bloque-autoridad/${producto.id}/flag_${idx}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, uploadFile, { upsert: true, contentType: file.type });
    setUploadingFlag(null);
    if (!error) {
      const url = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
      setForm(f => ({
        ...f,
        banderas: f.banderas.map((b, i) => i === idx ? url : b)
      }));
    } else {
      alert('Error subiendo bandera: ' + error.message);
    }
  };

  // Editar campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleEstadisticaChange = (key: keyof BloqueAutoridadDatos['estadisticas'], value: string) => {
    setForm(f => ({ ...f, estadisticas: { ...f.estadisticas, [key]: value } }));
  };
  const handleChipChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, chips: f.chips.map((c, i) => i === idx ? value : c) }));
  };
  const handleFlagChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, banderas: f.banderas.map((b, i) => i === idx ? value : b) }));
  };
  // Agregar/eliminar chips y banderas
  const handleAddChip = () => setForm(f => ({ ...f, chips: [...f.chips, ''] }));
  const handleRemoveChip = (idx: number) => setForm(f => ({ ...f, chips: f.chips.filter((_, i) => i !== idx) }));
  const handleAddFlag = () => setForm(f => ({ ...f, banderas: [...f.banderas, ''] }));
  const handleRemoveFlag = (idx: number) => setForm(f => ({ ...f, banderas: f.banderas.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('cursos_marketplace') // o servicios_marketplace según corresponda
      .update({ bloque_autoridad_datos: form })
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
    <div className="md:w-2/5 lg:w-2/5">
      <div className="sticky top-24">
        <div className="rounded-2xl bg-gray-800/80 backdrop-blur-sm p-8 shadow-2xl shadow-blue-500/10 border border-gray-700 text-center relative">
          {isAdmin && (
            <button
              className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10 hover:bg-blue-700 transition-all"
              style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setModalOpen(true)}
            >
              <Edit size={20} />
            </button>
          )}
          <img 
            src={form.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop'} 
            alt="Ponente" 
            className="w-full h-72 object-cover mb-6"
          />
          <h3 className="text-2xl font-bold leading-7 tracking-tight text-white">{form.nombre}</h3>
          <p className="text-sm leading-6 text-gray-400">{form.especialidades}</p>
          <div className="flex items-center justify-center gap-x-2 mt-4 flex-wrap">
            {form.banderas.map((b, i) => (
              <img key={i} src={b} alt="Bandera" className="h-4 rounded-sm" />
            ))}
          </div>
          <div className="mt-6 border-t border-gray-700 pt-6">
            <h4 className="text-base font-semibold text-white mb-3">Estadísticas Clave</h4>
            <ul className="space-y-3 text-sm text-gray-300 text-left">
              <li className="flex justify-between"><span>Años de Experiencia</span> <span className="font-mono text-amber-400">{form.estadisticas.años_experiencia}</span></li>
              <li className="flex justify-between"><span>Países</span> <span className="font-mono text-amber-400">{form.estadisticas.paises}</span></li>
              <li className="flex justify-between"><span>Estudiantes</span> <span className="font-mono text-amber-400">{form.estadisticas.estudiantes}</span></li>
              <li className="flex justify-between"><span>Comunidad</span> <span className="font-mono text-amber-400">{form.estadisticas.comunidad}</span></li>
            </ul>
          </div>
          <div className="mt-6 border-t border-gray-700 pt-6">
            <h4 className="text-base font-semibold text-white mb-3">Enfocado en</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {form.chips.map((c, i) => (
                <span key={i} className="bg-amber-400/10 text-amber-300 text-xs font-medium px-2 py-1 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Editar tarjeta de autoridad</h3>
            <label className="block text-gray-300 mb-2">Foto/avatar:</label>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="mb-2" />
            {uploading && <span className="text-blue-400">Subiendo...</span>}
            {form.avatar_url && <img src={form.avatar_url} alt="avatar" className="h-16 w-16 object-cover rounded-full mb-2 mx-auto" />}
            <label className="block text-gray-300 mb-2">Nombre:</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full mb-4 p-2 rounded text-gray-200 bg-gray-800" />
            <label className="block text-gray-300 mb-2">Especialidades:</label>
            <input type="text" name="especialidades" value={form.especialidades} onChange={handleChange} className="w-full mb-4 p-2 rounded text-gray-200 bg-gray-800" />
            <label className="block text-gray-300 mb-2">Agregar bandera:</label>
            <div className="flex gap-2 mb-4">
              <select
                className="w-full p-2 rounded text-gray-200 bg-gray-800"
                onChange={e => {
                  const selected = flagsList.find(f => f.code === e.target.value);
                  if (selected && !form.banderas.includes(selected.url)) {
                    setForm(f => ({ ...f, banderas: [...f.banderas, selected.url] }));
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Selecciona una bandera</option>
                {flagsList.map(flag => (
                  <option key={flag.code} value={flag.code}>{flag.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.banderas.map((b, i) => (
                <div key={i} className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1">
                  <img src={b} alt="Bandera" className="h-4" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, banderas: f.banderas.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600 ml-1">✕</button>
                </div>
              ))}
            </div>
            <label className="block text-gray-300 mb-2">Estadísticas clave:</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input type="text" value={form.estadisticas.años_experiencia} onChange={e => handleEstadisticaChange('años_experiencia', e.target.value)} placeholder="Años de experiencia" className="p-2 rounded text-gray-200 bg-gray-800" />
              <input type="text" value={form.estadisticas.paises} onChange={e => handleEstadisticaChange('paises', e.target.value)} placeholder="Países" className="p-2 rounded text-gray-200 bg-gray-800" />
              <input type="text" value={form.estadisticas.estudiantes} onChange={e => handleEstadisticaChange('estudiantes', e.target.value)} placeholder="Estudiantes" className="p-2 rounded text-gray-200 bg-gray-800" />
              <input type="text" value={form.estadisticas.comunidad} onChange={e => handleEstadisticaChange('comunidad', e.target.value)} placeholder="Comunidad" className="p-2 rounded text-gray-200 bg-gray-800" />
            </div>
            <label className="block text-gray-300 mb-2">Chips/enfoques:</label>
            {form.chips.map((c, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="text" value={c} onChange={e => handleChipChange(i, e.target.value)} className="w-full p-2 rounded text-gray-200 bg-gray-800" />
                <button type="button" onClick={() => handleRemoveChip(i)} className="bg-red-600 text-white px-2 py-1 rounded">Eliminar</button>
              </div>
            ))}
            <button type="button" onClick={handleAddChip} className="bg-blue-700 text-white px-4 py-2 rounded font-bold mb-4">Agregar chip</button>
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