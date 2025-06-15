import React, { useState } from 'react';
import ModalFuturista from './ModalFuturista';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  moduloId: string;
  descripcionHtml: string;
  setDescripcionHtml: (v: string) => void;
}

const DescripcionModuloEditor: React.FC<Props> = ({ open, onClose, moduloId, descripcionHtml, setDescripcionHtml }) => {
  const [descMsg, setDescMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSaveDescripcion() {
    if (!moduloId) {
      setDescMsg('Error: modulo_id vacío o inválido');
      return;
    }
    setDescMsg(null);
    setLoading(true);
    try {
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('modulos_descripcion')
        .select('id')
        .eq('modulo_id', moduloId)
        .single();
      let error;
      if (existente) {
        ({ error } = await supabase
          .from('modulos_descripcion')
          .update({ descripcion_html: descripcionHtml })
          .eq('id', existente.id));
      } else {
        ({ error } = await supabase
          .from('modulos_descripcion')
          .insert([{ modulo_id: moduloId, descripcion_html: descripcionHtml }]));
      }
      if (error) {
        setDescMsg('Error al guardar: ' + error.message + ' | modulo_id: ' + moduloId);
        setLoading(false);
        return;
      }
      setDescMsg('¡Guardado con éxito!');
      setTimeout(() => {
        setDescMsg(null);
        onClose();
      }, 800);
    } catch (err: any) {
      setDescMsg('Error inesperado: ' + (err.message || err));
    }
    setLoading(false);
  }

  return (
    <ModalFuturista open={open} onClose={onClose}>
      <div className="p-4 w-full max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Editar descripción del módulo</h3>
        <ReactQuill value={descripcionHtml} onChange={setDescripcionHtml} theme="snow" className="mb-4 bg-white text-black rounded" />
        {descMsg && <div className={`mb-2 text-center font-bold ${descMsg.startsWith('¡Guardado') ? 'text-green-400' : 'text-red-400'}`}>{descMsg}</div>}
        <div className="flex gap-4 mt-2 justify-center">
          <button onClick={handleSaveDescripcion} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </ModalFuturista>
  );
};

export default DescripcionModuloEditor; 