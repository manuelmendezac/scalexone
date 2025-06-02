import React from "react";
import { useNavigate } from "react-router-dom";
import LandingBePartnex from "../../components/templates/LandingBePartnex";

const templates = [
  {
    id: "landing-be-partnex",
    name: "Landing BePartnex",
    component: LandingBePartnex,
    description: "Plantilla moderna para landings de IA, comunidad y embudos."
  }
];

export default function TemplatesIndex() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Plantillas Disponibles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-4">
            <tpl.component />
            <div className="flex flex-col gap-2">
              <div className="font-bold text-lg">{tpl.name}</div>
              <div className="text-gray-400 text-sm mb-2">{tpl.description}</div>
              <button
                className="bg-lime-400 text-black px-4 py-2 rounded font-bold hover:bg-lime-300 transition"
                onClick={() => navigate(`/templates/editor/${tpl.id}`)}
              >
                Usar esta plantilla
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 