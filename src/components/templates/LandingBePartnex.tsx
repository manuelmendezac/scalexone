import React from "react";

export default function LandingBePartnex({
  title = "Construye, Automatiza y Escala tu Realidad Digital",
  subtitle = "El Sistema para Emprendedores que Quieren Evolucionar con IA, Embudos y Comunidad",
  ctaText1 = "Quiero Ser Parte",
  ctaText2 = "Ver Cómo Funciona",
  ctaLink1 = "#join",
  ctaLink2 = "#how",
  logo = "/logo.svg",
  highlight = "IA aplicada",
  image = "/images/stats.png"
}) {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <header className="py-6 px-6 flex justify-between items-center">
        <img src={logo} alt="Logo" className="h-10" />
        <a href={ctaLink1} className="bg-lime-400 text-black px-4 py-2 rounded font-bold text-sm">
          Acceder al Sistema
        </a>
      </header>
      <main className="text-center px-6 py-10">
        <div className="mb-2 text-sm text-gray-400">🚀 {highlight}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-300 max-w-xl mx-auto mb-6">{subtitle}</p>
        <div className="flex justify-center gap-4">
          <a href={ctaLink1} className="bg-lime-400 text-black px-6 py-3 rounded font-semibold text-sm">
            {ctaText1}
          </a>
          <a href={ctaLink2} className="border border-gray-500 px-6 py-3 rounded font-semibold text-sm">
            {ctaText2}
          </a>
        </div>
        <div className="mt-10">
          <img src={image} alt="Resultados" className="rounded-lg shadow-lg mx-auto w-full max-w-3xl" />
        </div>
      </main>
    </div>
  );
} 