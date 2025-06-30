import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Edit, Plus, Trash2 } from 'lucide-react';

interface FAQItem {
  pregunta: string;
  respuesta: string;
}

interface FAQDatos {
  titulo: string;
  subtitulo: string;
  faqs: FAQItem[];
}

interface Props {
  producto: any;
  onUpdate?: (nuevosDatos: FAQDatos) => void;
  isAdmin?: boolean;
}

const defaultData: FAQDatos = {
  titulo: 'Preguntas Frecuentes',
  subtitulo: 'Resolvemos tus dudas para que tomes la mejor decisión.',
  faqs: [
    {
      pregunta: '¿Para quién es este producto?',
      respuesta: 'Este producto está diseñado para emprendedores, creadores de contenido y profesionales que buscan optimizar su tiempo y maximizar su impacto.'
    },
    {
      pregunta: '¿Qué pasa si no me gusta?',
      respuesta: 'Ofrecemos una garantía de satisfacción de 7 días. Si no estás contento con tu compra, te devolvemos tu dinero, sin preguntas.'
    },
    {
      pregunta: '¿Tendré acceso a actualizaciones?',
      respuesta: 'Sí, todos los clientes reciben acceso a las futuras actualizaciones del producto sin coste adicional.'
    }
  ]
};

export default function FAQEditableSection({ producto, onUpdate, isAdmin }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FAQDatos>(
    producto.faq_datos || defaultData
  );
  const [saving, setSaving] = useState(false);

  const handleFAQChange = (idx: number, field: keyof FAQItem, value: string) => {
    setForm(f => ({
      ...f,
      faqs: f.faqs.map((faq, i) => i === idx ? { ...faq, [field]: value } : faq)
    }));
  };

  const handleAddFAQ = () => {
    setForm(f => ({
      ...f,
      faqs: [...f.faqs, { pregunta: '', respuesta: '' }]
    }));
  };

  const handleRemoveFAQ = (idx: number) => {
    if (form.faqs.length > 1) {
      setForm(f => ({
        ...f,
        faqs: f.faqs.filter((_, i) => i !== idx)
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Detectar si es curso o servicio
    const tabla = producto.tipo_pago && producto.categoria && producto.categoria.toLowerCase().includes('servicio') ? 'servicios_marketplace' : 'cursos_marketplace';
    const { error } = await supabase
      .from(tabla)
      .update({ faq_datos: form })
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
    <div className="bg-gray-900/50 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center relative">
          {isAdmin && (
            <button
              className="absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10 hover:bg-blue-700 transition-all"
              style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setModalOpen(true)}
            >
              <Edit size={20} />
            </button>
          )}
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{form.titulo}</h2>
          <p className="mt-4 text-lg text-gray-400">{form.subtitulo}</p>
        </div>
        <div className="mt-12 max-w-3xl mx-auto space-y-4">
          {form.faqs.map((faq, idx) => (
            <details key={idx} className="p-4 bg-black/30 rounded-lg group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                {faq.pregunta || <span className="italic text-gray-500">(Sin pregunta)</span>}
                <span className="group-open:rotate-45 transform transition-transform">+</span>
              </summary>
              <p className="mt-2 text-gray-400">{faq.respuesta}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Modal de edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Editar Preguntas Frecuentes</h3>
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Configuración General</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Título de la sección:</label>
                  <input 
                    type="text" 
                    value={form.titulo} 
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} 
                    className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Subtítulo:</label>
                  <input 
                    type="text" 
                    value={form.subtitulo} 
                    onChange={e => setForm(f => ({ ...f, subtitulo: e.target.value }))} 
                    className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {form.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-md font-semibold text-white">Pregunta {idx + 1}</h5>
                    {form.faqs.length > 1 && (
                      <button onClick={() => handleRemoveFAQ(idx)} className="bg-red-600 text-white p-1 rounded hover:bg-red-700"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Pregunta:</label>
                    <input type="text" value={faq.pregunta} onChange={e => handleFAQChange(idx, 'pregunta', e.target.value)} className="w-full p-2 rounded text-gray-200 bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Respuesta:</label>
                    <textarea value={faq.respuesta} onChange={e => handleFAQChange(idx, 'respuesta', e.target.value)} className="w-full p-2 rounded text-gray-200 bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleAddFAQ} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 mt-6"><Plus size={16} />Agregar Pregunta</button>
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