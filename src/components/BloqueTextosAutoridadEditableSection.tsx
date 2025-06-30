import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import { Edit, XCircle, CheckCircle } from 'lucide-react';

interface Bullet {
  tipo: 'negativo' | 'positivo';
  texto: string;
}

interface BloqueTextosAutoridadDatos {
  titulo: string;
  subtitulo: string;
  texto_destacado: string;
  frase: string;
  bullets: Bullet[];
}

interface Props {
  producto: any;
  onUpdate?: (nuevosDatos: BloqueTextosAutoridadDatos) => void;
  isAdmin?: boolean;
}

const defaultData: BloqueTextosAutoridadDatos = {
  titulo: 'Con más de 4 años operando de forma constante y disciplinada, VicForex ha perfeccionado un enfoque sólido basado en análisis técnico, acción del precio y gestión de riesgo inteligente.',
  subtitulo: 'Su método se ha forjado operando en vivo, bajo condiciones reales de mercado, y ha sido validado día tras día, sin atajos ni promesas vacías.',
  texto_destacado: 'En la Trading Room VicForex no solo analiza, sino que opera en tiempo real. Comparte su proceso, su lectura del mercado y su toma de decisiones, ayudando a traders a salir de la teoría y desarrollar una mentalidad operativa profesional.',
  frase: 'Una buena señal no es solo cuándo entrar. Es cuándo NO hacerlo. El silencio también es parte de una estrategia.',
  bullets: [
    { tipo: 'negativo', texto: 'Nada de cursos grabados o fórmulas mágicas.' },
    { tipo: 'positivo', texto: 'Acompañamiento real, entorno profesional, y evolución constante junto a una comunidad comprometida, global y enfocada en el crecimiento real.' }
  ]
};

export default function BloqueTextosAutoridadEditableSection({ producto, onUpdate, isAdmin }: Props) {
  const { isAdmin: authIsAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<BloqueTextosAutoridadDatos>(
    producto.bloque_textos_autoridad_datos || defaultData
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleBulletChange = (idx: number, value: string) => {
    setForm(f => ({
      ...f,
      bullets: f.bullets.map((b, i) => i === idx ? { ...b, texto: value } : b)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('cursos_marketplace') // o servicios_marketplace según corresponda
      .update({ bloque_textos_autoridad_datos: form })
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
    <div className="bg-transparent py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 relative">
        <div className="md:w-3/5 lg:w-3/5">
          <div className="relative bg-gray-800/40 border border-gray-700 rounded-lg p-8">
            {isAdmin && (
              <button
                className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10 hover:bg-blue-700 transition-all"
                style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setModalOpen(true)}
              >
                <Edit size={20} />
              </button>
            )}
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{form.titulo}</h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">{form.subtitulo}</p>
            <div className="mt-10 text-base leading-7 text-gray-200">
              <p>{form.texto_destacado}</p>
              <blockquote className={`italic text-gray-400 mt-4 border-l-2 border-amber-500 pl-4`}>
                "{form.frase}" – VicForex
              </blockquote>
              <ul className="mt-8 space-y-4">
                {form.bullets.map((b, idx) => (
                  <li key={idx} className="flex gap-x-3 items-start">
                    {b.tipo === 'negativo' ? (
                      <XCircle className="mt-1 h-5 w-5 flex-none text-red-500" aria-hidden="true" />
                    ) : (
                      <CheckCircle className="mt-1 h-5 w-5 flex-none text-green-500" aria-hidden="true" />
                    )}
                    <span><strong className="font-semibold text-white">{b.texto}</strong></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Editar bloque de textos de autoridad</h3>
            <label className="block text-gray-300 mb-2">Título principal:</label>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} className="w-full mb-4 p-2 rounded text-gray-200 bg-gray-800" />
            <label className="block text-gray-300 mb-2">Subtítulo:</label>
            <input type="text" name="subtitulo" value={form.subtitulo} onChange={handleChange} className="w-full mb-4 p-2 rounded text-gray-200 bg-gray-800" />
            <label className="block text-gray-300 mb-2">Texto destacado:</label>
            <textarea name="texto_destacado" value={form.texto_destacado} onChange={handleChange} className="w-full mb-4 p-2 rounded text-gray-200 bg-gray-800" />
            <label className="block text-gray-300 mb-2">Frase/quote:</label>
            <input type="text" name="frase" value={form.frase} onChange={handleChange} className="w-full mb-4 p-2 rounded text-gray-200 bg-gray-800" />
            <label className="block text-gray-300 mb-2">Bullets:</label>
            {form.bullets.map((b, idx) => (
              <input key={idx} type="text" value={b.texto} onChange={e => handleBulletChange(idx, e.target.value)} className="w-full mb-2 p-2 rounded text-gray-200 bg-gray-800" />
            ))}
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