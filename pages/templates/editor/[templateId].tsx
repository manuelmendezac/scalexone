import React, { useState } from "react";
import { useParams } from "react-router-dom";
import LandingBePartnex from "../../../components/templates/LandingBePartnex";
import LandingSenalesPro from "../../../components/templates/LandingSenalesPro";

const templates = {
  "landing-be-partnex": LandingBePartnex,
  "senales-pro": LandingSenalesPro
};

export default function TemplateEditor() {
  const { templateId } = useParams();
  const TemplateComponent = templates[templateId as keyof typeof templates];

  // Estado para props editables
  const [props, setProps] = useState(
    templateId === "senales-pro"
      ? {
          logo: "/logo.svg",
          title: "SEÑALES PRO VICFOREX",
          subtitle: "Recibe 3 meses gratis hoy mismo!",
          button1Text: "Quiero Ser Parte",
          button1Link: "#join",
          button2Text: "Ver Cómo Funciona",
          button2Link: "#how"
        }
      : {
          title: "Construye, Automatiza y Escala tu Realidad Digital",
          subtitle: "El Sistema para Emprendedores que Quieren Evolucionar con IA, Embudos y Comunidad",
          ctaText1: "Quiero Ser Parte",
          ctaText2: "Ver Cómo Funciona",
          ctaLink1: "#join",
          ctaLink2: "#how",
          logo: "/logo.svg",
          highlight: "IA aplicada",
          image: "/images/stats.png",
          // Props dummy para evitar errores de tipo
          button1Text: "",
          button1Link: "",
          button2Text: "",
          button2Link: ""
        }
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setProps({ ...props, [e.target.name]: e.target.value });
  }

  function handlePublish() {
    // Aquí luego se conectará con Supabase o backend
    console.log("Datos personalizados:", props);
    alert("¡Datos impresos en consola! (Simulación de publicación)");
  }

  if (!TemplateComponent) {
    return <div className="text-red-500 p-8">Plantilla no encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row gap-8 p-8">
      {/* Panel de edición */}
      <div className="w-full md:w-1/3 bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">Editar Plantilla</h2>
        {/* Campos para BePartnex */}
        {templateId !== "senales-pro" && (
          <>
            <label className="text-sm">Título
              <input name="title" value={props.title} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Subtítulo
              <textarea name="subtitle" value={props.subtitle} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Texto Botón 1
              <input name="ctaText1" value={props.ctaText1} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Texto Botón 2
              <input name="ctaText2" value={props.ctaText2} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Enlace Botón 1
              <input name="ctaLink1" value={props.ctaLink1} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Enlace Botón 2
              <input name="ctaLink2" value={props.ctaLink2} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Logo (URL)
              <input name="logo" value={props.logo} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Highlight
              <input name="highlight" value={props.highlight} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Imagen principal (URL)
              <input name="image" value={props.image} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
          </>
        )}
        {/* Solo mostrar los campos si la plantilla es 'senales-pro' */}
        {templateId === "senales-pro" && (
          <>
            <label className="text-sm">Logo (URL o subir imagen)
              <input name="logo" value={props.logo} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Título principal
              <input name="title" value={props.title} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Subtítulo
              <input name="subtitle" value={props.subtitle} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Texto Botón 1
              <input name="button1Text" value={props.button1Text} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Enlace Botón 1
              <input name="button1Link" value={props.button1Link} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Texto Botón 2
              <input name="button2Text" value={props.button2Text} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
            <label className="text-sm">Enlace Botón 2
              <input name="button2Link" value={props.button2Link} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white mb-2" />
            </label>
          </>
        )}
        <button onClick={handlePublish} className="mt-4 bg-lime-400 text-black px-4 py-2 rounded font-bold hover:bg-lime-300 transition">
          Publicar en mi dominio
        </button>
      </div>
      {/* Vista previa en tiempo real */}
      <div className="w-full md:w-2/3 flex items-center justify-center">
        <div className="w-full max-w-3xl border-2 border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <TemplateComponent {...props} />
        </div>
      </div>
    </div>
  );
} 