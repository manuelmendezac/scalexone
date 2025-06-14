import React, { useEffect, useState } from 'react';
import ModalFuturista from './ModalFuturista';
import { supabase } from '../supabase';

interface CertificacionAdminModalProps {
  open: boolean;
  onClose: () => void;
  curso_id: string;
  isAdmin: boolean;
}

const camposIniciales = {
  titulo: '',
  texto_secundario: '',
  video_url: '',
  texto_llamado: '',
  texto_boton: '',
  enlace_boton: '',
  imagen_certificado: '',
  texto_importante: '',
  imagenes_alianzas: [],
  texto_final: '',
};

const CertificacionAdminModal: React.FC<CertificacionAdminModalProps> = ({ open, onClose, curso_id, isAdmin }) => {
  const [form, setForm] = useState<any>(camposIniciales);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certId, setCertId] = useState<string | null>(null);

  // Cargar datos existentes
  useEffect(() => {
    if (open && curso_id) {
      setLoading(true);
      supabase
        .from('certificaciones_curso')
        .select('*')
        .eq('curso_id', curso_id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setForm({ ...camposIniciales, ...data, imagenes_alianzas: data.imagenes_alianzas || [] });
            setCertId(data.id);
          } else {
            setForm(camposIniciales);
            setCertId(null);
          }
          setLoading(false);
        });
    }
  }, [open, curso_id]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Imagen certificado
  const handleCertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const { data, error } = await supabase.storage.from('certificados').upload(`cert_${curso_id}_${Date.now()}`, file, { upsert: true });
    if (error) return setError('Error al subir imagen');
    const { data: urlData } = supabase.storage.from('certificados').getPublicUrl(data.path);
    setForm({ ...form, imagen_certificado: urlData.publicUrl });
  };

  // Imagenes alianzas
  const handleAlianzasImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const urls: string[] = [];
    for (const file of files) {
      const { data, error } = await supabase.storage.from('alianzas').upload(`alianza_${curso_id}_${Date.now()}_${file.name}`, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from('alianzas').getPublicUrl(data.path);
        urls.push(urlData.publicUrl);
      }
    }
    setForm({ ...form, imagenes_alianzas: [...(form.imagenes_alianzas || []), ...urls] });
  };

  // Guardar
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload = { ...form, curso_id };
    if (certId) {
      // update
      const { error } = await supabase.from('certificaciones_curso').update(payload).eq('id', certId);
      if (error) setError('Error al guardar');
    } else {
      // insert
      const { error } = await supabase.from('certificaciones_curso').insert([payload]);
      if (error) setError('Error al crear');
    }
    setSaving(false);
    onClose();
  };

  if (!isAdmin) return null;

  return (
    <ModalFuturista open={open} onClose={onClose}>
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Editar sección de certificación</h2>
        {loading ? <div className="text-cyan-400">Cargando...</div> : <>
          <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título principal" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" />
          <input name="texto_secundario" value={form.texto_secundario} onChange={handleChange} placeholder="Texto secundario" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" />
          <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="Enlace de video (YouTube/Vimeo)" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" />
          {form.video_url && <iframe src={form.video_url.replace('watch?v=', 'embed/')} className="w-full aspect-video rounded my-2" allowFullScreen />}
          <input name="texto_llamado" value={form.texto_llamado} onChange={handleChange} placeholder="Texto de llamado a la acción" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" />
          <div className="flex gap-2">
            <input name="texto_boton" value={form.texto_boton} onChange={handleChange} placeholder="Texto del botón" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white flex-1" />
            <input name="enlace_boton" value={form.enlace_boton} onChange={handleChange} placeholder="Enlace del botón" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white flex-1" />
          </div>
          <div>
            <label className="text-cyan-300 font-semibold">Imagen del certificado (600x400px recomendado)</label>
            <input type="file" accept="image/*" onChange={handleCertImage} />
            {form.imagen_certificado && <img src={form.imagen_certificado} alt="certificado" className="w-full max-w-xs rounded my-2" />}
          </div>
          <textarea name="texto_importante" value={form.texto_importante} onChange={handleChange} placeholder="Texto importante" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" />
          <div>
            <label className="text-cyan-300 font-semibold">Imágenes de alianzas (120x40px recomendado, puedes subir varias)</label>
            <input type="file" accept="image/*" multiple onChange={handleAlianzasImages} />
            <div className="flex flex-wrap gap-2 mt-2">
              {form.imagenes_alianzas && form.imagenes_alianzas.map((url: string, i: number) => (
                <img key={i} src={url} alt="alianza" className="h-10 rounded bg-white border border-cyan-400" />
              ))}
            </div>
          </div>
          <textarea name="texto_final" value={form.texto_final} onChange={handleChange} placeholder="Texto final (alianzas, disclaimers, etc)" className="p-2 rounded bg-neutral-800 border border-cyan-400 text-white" />
          {error && <div className="text-red-400 font-bold">{error}</div>}
          <button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded transition mt-2">{saving ? 'Guardando...' : 'Guardar'}</button>
        </>}
      </div>
    </ModalFuturista>
  );
};

export default CertificacionAdminModal; 