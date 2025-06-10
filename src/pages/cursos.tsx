import React, { useState } from 'react';
import useNeuroState from '../store/useNeuroState';

const cursosMock = [
  {
    id: 'traffic',
    nombre: 'TRAFFIC MASTER',
    descripcion: 'Aprende desde cero hasta nivel experto, el mismo paso a paso que ya han utilizado miles de personas para convertirse en Traffic Masters y ganar cientos o incluso miles de dólares al día, ayudando a marcas y empresas a incrementar sus ventas.',
    color: 'text-green-400',
    bg: 'bg-black',
    imagen: '/images/curso-traffic.png',
  },
  {
    id: 'creador',
    nombre: 'CREADOR DE CONTENIDO MASTER',
    descripcion: 'Domina la creación de contenido para redes sociales, blogs y más. Aprende a captar la atención y construir audiencias.',
    color: 'text-white',
    bg: 'bg-black',
    imagen: '/images/curso-creador.png',
  },
  {
    id: 'copy',
    nombre: 'COPYWRITING MASTER',
    descripcion: 'Conviértete en un experto en persuasión y ventas a través de la palabra escrita. Técnicas de copywriting para todos los niveles.',
    color: 'text-white',
    bg: 'bg-black',
    imagen: '/images/curso-copy.png',
  },
  {
    id: 'afiliado',
    nombre: 'AFILIADO MASTER',
    descripcion: 'Aprende a generar ingresos como afiliado, promocionando productos y servicios de terceros de forma profesional.',
    color: 'text-white',
    bg: 'bg-black',
    imagen: '/images/curso-afiliado.png',
  },
  {
    id: 'commerce',
    nombre: 'COMMERCE MASTER',
    descripcion: 'Todo sobre e-commerce: desde montar tu tienda online hasta estrategias avanzadas de ventas y logística.',
    color: 'text-white',
    bg: 'bg-black',
    imagen: '/images/curso-commerce.png',
  },
  {
    id: 'infocreador',
    nombre: 'INFOCREADOR MASTER',
    descripcion: 'Crea y vende infoproductos digitales de alto valor. Aprende a empaquetar tu conocimiento y escalar tus ingresos.',
    color: 'text-white',
    bg: 'bg-black',
    imagen: '/images/curso-infocreador.png',
  },
];

const CursosPage: React.FC = () => {
  const [cursoActivo, setCursoActivo] = useState(cursosMock[0]);
  const { userName } = useNeuroState();
  const primerNombre = userName ? userName.split(' ')[0] : 'Master';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start py-10 px-2">
      {/* Header */}
      <div className="w-full flex justify-end items-center mb-8 px-2 max-w-7xl mx-auto">
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-neutral-900 text-white font-semibold border border-neutral-700">Próximamente</button>
          <button className="px-3 py-2 rounded-full bg-neutral-900 text-white font-semibold border border-neutral-700">?</button>
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold border border-neutral-700">MU</div>
        </div>
      </div>
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-light text-center mb-8">
        Hola <span className="text-yellow-400 font-bold">{primerNombre}</span>, ¿Qué quieres aprender hoy?
      </h1>
      {/* Botones de cursos */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {cursosMock.map((curso) => (
          <div
            key={curso.id}
            className=""
            onMouseEnter={() => setCursoActivo(curso)}
          >
            <button
              onClick={() => setCursoActivo(curso)}
              className={`px-4 py-3 rounded-lg border border-white font-black uppercase tracking-wide text-base md:text-lg bg-black transition-all duration-200 ${cursoActivo.id === curso.id ? 'bg-white text-green-400' : 'text-white hover:bg-white hover:text-green-400'}`}
              style={{ minWidth: 180 }}
            >
              <span className={curso.color}>{curso.nombre}</span>
            </button>
          </div>
        ))}
      </div>
      {/* Área principal de curso seleccionado */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl mb-10">
        <img src={cursoActivo.imagen} alt={cursoActivo.nombre} className="w-64 h-64 object-cover rounded-xl border-4 border-green-400 shadow-lg bg-black" />
        <div className="flex-1 flex flex-col items-center md:items-start">
          <div className="font-black text-2xl mb-2 text-green-400">{cursoActivo.nombre}</div>
          <div className="text-base text-neutral-200 mb-6 text-center md:text-left">{cursoActivo.descripcion}</div>
          <button className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-yellow-400 transition text-lg">Ingresar</button>
        </div>
      </div>
      {/* Botones secundarios */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <button className="px-6 py-2 rounded-full border border-white text-white font-semibold bg-black hover:bg-neutral-900 transition">¿No sabes por dónde comenzar?</button>
        <button className="px-6 py-2 rounded-full border border-white text-white font-semibold bg-black hover:bg-neutral-900 transition flex items-center gap-2"><span role="img" aria-label="bonus">🎁</span> Bonus</button>
      </div>
      {/* Footer */}
      <footer className="w-full text-center text-neutral-400 text-sm py-4">Keep Growing.</footer>
    </div>
  );
};

export default CursosPage; 