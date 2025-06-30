import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Edit, Star, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { StripePaymentButton } from './StripePaymentButton';
import { StripeService } from '../services/stripeService';

interface Caracteristica {
  texto: string;
  incluida: boolean;
}

interface PlanMembresia {
  nombre: string;
  precio: number;
  tipo_pago: 'pago_unico' | 'suscripcion';
  duracion_texto: string; // "Mensual", "Trimestral", "Semestral", etc.
  descripcion: string;
  destacado: boolean;
  principal?: boolean;
  caracteristicas: Caracteristica[];
  stripe_price_id?: string;
  periodicidad?: 'month' | 'year' | 'quarter' | 'semiannual';
}

interface MembresiasDatos {
  titulo_seccion: string;
  subtitulo: string;
  planes: PlanMembresia[];
}

interface Props {
  producto: any;
  onUpdate?: (nuevosDatos: MembresiasDatos) => void;
  isAdmin?: boolean;
}

const defaultData: MembresiasDatos = {
  titulo_seccion: 'Elige tu plan de acceso',
  subtitulo: 'Acceso inmediato a la comunidad, sesiones en vivo y todos los beneficios.',
  planes: [
    {
      nombre: 'Plan Básico',
      precio: 99,
      tipo_pago: 'suscripcion',
      duracion_texto: 'Mensual',
      descripcion: 'Perfecto para dar tu primer paso.',
      destacado: false,
      caracteristicas: [
        { texto: 'Sesiones de Trading en Vivo', incluida: true },
        { texto: 'Alertas en Tiempo Real', incluida: true },
        { texto: 'Comunidad Global de Traders', incluida: true },
        { texto: 'Bonos VicForex', incluida: true },
        { texto: 'Bonos Premium', incluida: false },
        { texto: 'Mentoría 1x1', incluida: false }
      ]
    },
    {
      nombre: 'Plan Pro',
      precio: 147,
      tipo_pago: 'suscripcion',
      duracion_texto: 'Trimestral',
      descripcion: 'Ahorra $150 vs pagar mes a mes.',
      destacado: true,
      caracteristicas: [
        { texto: 'Sesiones de Trading en Vivo', incluida: true },
        { texto: 'Alertas en Tiempo Real', incluida: true },
        { texto: 'Comunidad Global de Traders', incluida: true },
        { texto: 'Bonos VicForex', incluida: true },
        { texto: 'Bonos Premium', incluida: true },
        { texto: 'Mentoría 1x1', incluida: false }
      ]
    },
    {
      nombre: 'Plan Avanzado',
      precio: 175,
      tipo_pago: 'suscripcion',
      duracion_texto: 'Semestral',
      descripcion: '¡Menos de $1 por día!',
      destacado: false,
      caracteristicas: [
        { texto: 'Sesiones de Trading en Vivo', incluida: true },
        { texto: 'Alertas en Tiempo Real', incluida: true },
        { texto: 'Comunidad Global de Traders', incluida: true },
        { texto: 'Bonos VicForex', incluida: true },
        { texto: 'Bonos Premium', incluida: true },
        { texto: 'Mentoría 1x1', incluida: true }
      ]
    }
  ]
};

export default function MembresiasEditableSection({ producto, onUpdate, isAdmin }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<MembresiasDatos>(
    producto.membresias_datos || defaultData
  );
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handlePlanChange = (planIndex: number, field: keyof PlanMembresia, value: any) => {
    setForm(f => ({
      ...f,
      planes: f.planes.map((plan, i) => 
        i === planIndex ? { ...plan, [field]: value } : plan
      )
    }));
  };

  const handleCaracteristicaChange = (planIndex: number, caracIndex: number, field: keyof Caracteristica, value: any) => {
    setForm(f => ({
      ...f,
      planes: f.planes.map((plan, i) => 
        i === planIndex ? {
          ...plan,
          caracteristicas: plan.caracteristicas.map((carac, j) => 
            j === caracIndex ? { ...carac, [field]: value } : carac
          )
        } : plan
      )
    }));
  };

  const handleAddPlan = () => {
    setForm(f => ({
      ...f,
      planes: [...f.planes, {
        nombre: 'Nuevo Plan',
        precio: 99,
        tipo_pago: 'suscripcion',
        duracion_texto: 'Mensual',
        descripcion: 'Descripción del plan.',
        destacado: false,
        caracteristicas: [
          { texto: 'Característica 1', incluida: true },
          { texto: 'Característica 2', incluida: false }
        ]
      }]
    }));
  };

  const handleRemovePlan = (planIndex: number) => {
    if (form.planes.length > 1) {
      setForm(f => ({
        ...f,
        planes: f.planes.filter((_, i) => i !== planIndex)
      }));
    }
  };

  const handleAddCaracteristica = (planIndex: number) => {
    setForm(f => ({
      ...f,
      planes: f.planes.map((plan, i) => 
        i === planIndex ? {
          ...plan,
          caracteristicas: [...plan.caracteristicas, { texto: 'Nueva característica', incluida: true }]
        } : plan
      )
    }));
  };

  const handleRemoveCaracteristica = (planIndex: number, caracIndex: number) => {
    setForm(f => ({
      ...f,
      planes: f.planes.map((plan, i) => 
        i === planIndex ? {
          ...plan,
          caracteristicas: plan.caracteristicas.filter((_, j) => j !== caracIndex)
        } : plan
      )
    }));
  };

  const handleSetPrincipal = (planIndex: number) => {
    setForm(f => ({
      ...f,
      planes: f.planes.map((plan, i) => ({
        ...plan,
        principal: i === planIndex
      }))
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    let updatedForm = { ...form };
    // Para cada plan sin stripe_price_id, crear producto/precio en Stripe
    for (let i = 0; i < updatedForm.planes.length; i++) {
      const plan = updatedForm.planes[i];
      if (!plan.stripe_price_id) {
        try {
          const result = await StripeService.createProduct({
            nombre: plan.nombre,
            descripcion: plan.descripcion,
            precio: plan.precio,
            tipo_pago: plan.tipo_pago,
            periodicidad: plan.tipo_pago === 'suscripcion' ? plan.periodicidad || 'month' : undefined,
          });
          updatedForm.planes[i].stripe_price_id = result.stripe_price_id;
        } catch (err) {
          setSaving(false);
          alert('Error creando el plan en Stripe: ' + (err as Error).message);
          return;
        }
      }
    }
    // Detectar tipo de producto y tabla
    let tabla = 'cursos_marketplace';
    if (producto.tipo === 'servicio') tabla = 'servicios_marketplace';
    if (producto.tipo === 'software') tabla = 'software_marketplace';
    const { error } = await supabase
      .from(tabla)
      .update({ membresias_datos: updatedForm })
      .eq('id', producto.id);
    setSaving(false);
    if (!error) {
      onUpdate && onUpdate(updatedForm);
      setModalOpen(false);
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const getThemeType = (category?: string): 'curso' | 'servicio' | 'software' => {
    if (!category) return 'curso';
    const cat = category.toLowerCase();
    if (cat.includes('curso') || cat.includes('training') || cat.includes('educación')) return 'curso';
    if (cat.includes('software') || cat.includes('saas') || cat.includes('app')) return 'software';
    return 'servicio';
  };

  const theme = getThemeType(producto.categoria);

  return (
    <div className="relative bg-black py-16 sm:py-24">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,78,216,0.2)_0%,rgba(0,0,0,0)_70%)]"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
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
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{form.titulo_seccion}</h2>
          <p className="mt-4 text-lg text-gray-400">{form.subtitulo}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {form.planes.map((plan, planIndex) => (
            <div 
              key={planIndex}
              className={`relative ${plan.destacado 
                ? 'bg-gray-900 p-8 rounded-2xl border-2 border-green-400 shadow-2xl shadow-green-500/20 flex flex-col h-full -my-4' 
                : 'bg-gray-900/50 p-8 rounded-2xl border border-blue-900/40 shadow-xl flex flex-col h-full'
              }`}
            >
              {plan.destacado && (
                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                  <span className="bg-green-400 text-black text-sm font-bold uppercase px-4 py-1 rounded-full flex items-center gap-2">
                    <Star size={16}/>El favorito de todos
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Star size={18} className={plan.destacado ? "text-green-400" : theme === 'curso' ? "text-amber-400" : theme === 'servicio' ? "text-purple-400" : "text-cyan-400"}/>
                {plan.nombre}
              </h3>
              <div className="flex items-baseline gap-3 my-4">
                <p className="text-5xl font-extrabold text-white">
                  ${plan.precio}<span className="text-3xl font-bold">.00</span>
                </p>
                <span className="bg-gray-700 text-gray-300 px-2 py-1 text-xs font-semibold rounded">
                  {plan.tipo_pago === 'pago_unico' ? 'Pago Único' : plan.duracion_texto}
                </span>
              </div>
              <p className="text-gray-400 mb-6 min-h-[40px]">{plan.descripcion}</p>
              <button className={`w-full ${plan.destacado 
                ? 'bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-all'
                : theme === 'curso' 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-all'
                  : theme === 'servicio'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition-all'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all'
              }`}>
                {plan.tipo_pago === 'pago_unico' ? 'Contratar' : 'Suscribirse'}
              </button>
              <p className="text-white font-semibold mt-8 mb-4">Lo que incluye:</p>
              <ul className="space-y-3 text-gray-300 flex-grow">
                {plan.caracteristicas.map((carac, caracIndex) => (
                  <li key={caracIndex} className={`flex gap-3 ${!carac.incluida ? 'text-gray-500' : ''}`}>
                    {carac.incluida ? (
                      <CheckCircle className={`${plan.destacado ? 'text-green-400' : theme === 'curso' ? 'text-amber-400' : theme === 'servicio' ? 'text-purple-400' : 'text-cyan-400'} w-5 h-5 flex-shrink-0`} />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    {carac.texto}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de edición */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Editar sección de membresías</h3>
            
            {/* Configuración general */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Configuración General</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Título de la sección:</label>
                  <input 
                    type="text" 
                    name="titulo_seccion" 
                    value={form.titulo_seccion} 
                    onChange={handleChange} 
                    className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Subtítulo:</label>
                  <input 
                    type="text" 
                    name="subtitulo" 
                    value={form.subtitulo} 
                    onChange={handleChange} 
                    className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                  />
                </div>
              </div>
            </div>

            {/* Planes */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white">Planes de Membresía</h4>
                <button 
                  onClick={handleAddPlan}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <Plus size={16} /> Agregar Plan
                </button>
              </div>

              {form.planes.map((plan, planIndex) => (
                <div key={planIndex} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-md font-semibold text-white">Plan {planIndex + 1}</h5>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        className={`px-2 py-1 rounded text-xs font-bold ${plan.principal ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-300'} border border-green-500`}
                        onClick={() => handleSetPrincipal(planIndex)}
                      >
                        {plan.principal ? 'Principal' : 'Marcar como principal'}
                      </button>
                      {form.planes.length > 1 && (
                        <button
                          onClick={() => handleRemovePlan(planIndex)}
                          className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Nombre:</label>
                      <input 
                        type="text" 
                        value={plan.nombre} 
                        onChange={e => handlePlanChange(planIndex, 'nombre', e.target.value)} 
                        className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Precio ($):</label>
                      <input 
                        type="number" 
                        value={plan.precio} 
                        onChange={e => handlePlanChange(planIndex, 'precio', parseInt(e.target.value) || 0)} 
                        className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Tipo de pago:</label>
                      <select 
                        value={plan.tipo_pago} 
                        onChange={e => handlePlanChange(planIndex, 'tipo_pago', e.target.value as 'pago_unico' | 'suscripcion')} 
                        className="w-full p-2 rounded text-gray-200 bg-gray-700"
                      >
                        <option value="suscripcion">Suscripción</option>
                        <option value="pago_unico">Pago Único</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Duración:</label>
                      <input 
                        type="text" 
                        value={plan.duracion_texto} 
                        onChange={e => handlePlanChange(planIndex, 'duracion_texto', e.target.value)} 
                        placeholder="Mensual, Trimestral, etc."
                        className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Descripción:</label>
                      <input 
                        type="text" 
                        value={plan.descripcion} 
                        onChange={e => handlePlanChange(planIndex, 'descripcion', e.target.value)} 
                        className="w-full p-2 rounded text-gray-200 bg-gray-700" 
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center text-gray-300">
                        <input 
                          type="checkbox" 
                          checked={plan.destacado} 
                          onChange={e => handlePlanChange(planIndex, 'destacado', e.target.checked)} 
                          className="mr-2"
                        />
                        Plan destacado
                      </label>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Stripe Price ID:</label>
                      <input
                        type="text"
                        value={plan.stripe_price_id || ''}
                        onChange={e => handlePlanChange(planIndex, 'stripe_price_id', e.target.value)}
                        className="w-full p-2 rounded text-gray-200 bg-gray-700"
                        placeholder="Ej: price_1N..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Periodicidad:</label>
                      <select
                        value={plan.periodicidad || 'month'}
                        onChange={e => handlePlanChange(planIndex, 'periodicidad', e.target.value)}
                        className="w-full p-2 rounded text-gray-200 bg-gray-700"
                        disabled={plan.tipo_pago !== 'suscripcion'}
                      >
                        <option value="month">Mensual</option>
                        <option value="quarter">Trimestral</option>
                        <option value="semiannual">Semestral</option>
                        <option value="year">Anual</option>
                      </select>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h6 className="text-sm font-semibold text-white">Características</h6>
                      <button 
                        onClick={() => handleAddCaracteristica(planIndex)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {plan.caracteristicas.map((carac, caracIndex) => (
                        <div key={caracIndex} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={carac.incluida} 
                            onChange={e => handleCaracteristicaChange(planIndex, caracIndex, 'incluida', e.target.checked)} 
                            className="mr-2"
                          />
                          <input 
                            type="text" 
                            value={carac.texto} 
                            onChange={e => handleCaracteristicaChange(planIndex, caracIndex, 'texto', e.target.value)} 
                            className="flex-1 p-2 rounded text-gray-200 bg-gray-700" 
                          />
                          <button 
                            onClick={() => handleRemoveCaracteristica(planIndex, caracIndex)}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {form.planes.length > 1 && (
              <div className="mb-8 flex flex-col items-center">
                <label className="text-white font-semibold mb-2">Elige tu plan:</label>
                <div className="flex gap-4">
                  {form.planes.map((plan, idx) => (
                    <label key={idx} className={`px-4 py-2 rounded-lg cursor-pointer border-2 transition-all ${selectedPlan === idx ? 'border-green-400 bg-gray-800' : 'border-gray-700 bg-gray-900'}`}>
                      <input
                        type="radio"
                        name="planSelector"
                        checked={selectedPlan === idx}
                        onChange={() => setSelectedPlan(idx)}
                        className="mr-2"
                      />
                      {plan.nombre}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              {form.planes[selectedPlan] && form.planes[selectedPlan].stripe_price_id ? (
                <StripePaymentButton
                  productData={{
                    nombre: form.planes[selectedPlan].nombre,
                    descripcion: form.planes[selectedPlan].descripcion,
                    precio: form.planes[selectedPlan].precio,
                    tipo_pago: form.planes[selectedPlan].tipo_pago,
                  }}
                  metadata={{ plan_index: selectedPlan, producto_id: producto.id, tipo_producto: producto.tipo }}
                  className="w-full max-w-md"
                >
                  {form.planes[selectedPlan].tipo_pago === 'pago_unico' ? 'Contratar' : 'Suscribirse'}
                </StripePaymentButton>
              ) : (
                <button className="w-full max-w-md bg-gray-700 text-gray-400 py-4 px-6 rounded-lg text-xl cursor-not-allowed" disabled>
                  Configura el Stripe Price ID para habilitar el pago
                </button>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={handleSave} disabled={saving} className="bg-green-500 text-black px-4 py-2 rounded font-bold">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setModalOpen(false)} className="bg-gray-700 text-white px-4 py-2 rounded">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 