import React from 'react';
import { useParams } from 'react-router-dom';

const mockCurso = {
  id: 1,
  titulo: 'Traffic Master',
  descripcion: 'Tu puerta de entrada a las estrategias de tráfico pago. Aprende a lanzar campañas, crear tu agencia y dominar el marketing digital.',
  imagen: '/img/traffic-master.jpg',
  modulos: [
    {
      titulo: '1. Bienvenido a Traffic Master',
      descripcion: '¡Felicidades! Esta es tu puerta de entrada para entrenarte como Traffic Master...',
      nivel: 'Junior',
      clases: 2,
    },
    {
      titulo: '2. Los primeros pasos del Traffic Master',
      descripcion: 'Es momento de conocer con claridad lo que hace un Traffic Master...',
      nivel: 'Junior',
      clases: 4,
    },
    {
      titulo: '3. Conozcamos la habilidad',
      descripcion: 'La habilidad del tráfico pago es una subdivisión del marketing digital...',
      nivel: 'Junior',
      clases: 4,
    },
  ],
  complementario: [
    { nombre: 'Zully Nathalia Mora', curso: 'Lamparas 3D', imagen: '/img/zully.jpg' },
    { nombre: 'Raul Huaman', curso: 'Curso de Sanación Familiar', imagen: '/img/raul.jpg' },
  ],
  comunidad: {
    titulo: 'Comunidad',
    descripcion: '¿Qué hay de nuevo en tu comunidad?',
    links: [
      { texto: 'Ver Master Adventure', color: 'red' },
      { texto: 'Grupo de anuncios', color: 'green' },
      { texto: 'Comunidad de Facebook', color: 'blue' },
    ],
  },
  eventos: [
    { titulo: 'Cafecito con Mike', dia: 'Lunes', hora: '6:30pm', plataforma: 'Zoom' },
    { titulo: 'Preguntas y Respuestas Tráfico Pago', dia: 'Jueves', hora: '6:00pm', plataforma: 'Google Meet' },
  ],
  certificacion: {
    titulo: 'Obtén tu Certificado',
    boton: 'Solicitar',
  },
};

const CursoDetalle = () => {
  const { id } = useParams();
  // En el futuro, aquí se buscará el curso por ID
  const curso = mockCurso;

  return (
    <div className="curso-detalle-page bg-black min-h-screen text-white p-4">
      {/* Encabezado */}
      <section className="encabezado flex flex-col md:flex-row items-center gap-6 mb-10">
        <img src={curso.imagen} alt={curso.titulo} className="w-64 h-40 object-cover rounded-lg shadow-lg" />
        <div>
          <h1 className="text-4xl font-bold mb-2">{curso.titulo}</h1>
          <p className="text-lg mb-4">{curso.descripcion}</p>
          <button className="bg-white text-black px-6 py-2 rounded-full font-semibold">Iniciar</button>
        </div>
      </section>

      {/* Módulos */}
      <section className="modulos mb-10">
        <h2 className="text-2xl font-bold mb-4">Módulos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {curso.modulos.map((mod, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-2">{mod.titulo}</h3>
              <p className="mb-2">{mod.descripcion}</p>
              <div className="flex items-center gap-4 text-sm mb-2">
                <span>🧱 Nivel: {mod.nivel}</span>
                <span>▶️ Clases: {mod.clases}</span>
              </div>
              <button className="bg-white text-black px-4 py-1 rounded-full font-semibold">Iniciar</button>
            </div>
          ))}
        </div>
      </section>

      {/* Complementario */}
      <section className="complementario mb-10">
        <h2 className="text-2xl font-bold mb-4">Complementario</h2>
        <div className="flex gap-6 overflow-x-auto">
          {curso.complementario.map((comp, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-xl p-4 min-w-[200px] flex flex-col items-center">
              <img src={comp.imagen} alt={comp.nombre} className="w-24 h-24 object-cover rounded-full mb-2" />
              <div className="text-center">
                <div className="font-bold">{comp.nombre}</div>
                <div className="text-sm">{comp.curso}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comunidad */}
      <section className="comunidad mb-10">
        <h2 className="text-2xl font-bold mb-4">{curso.comunidad.titulo}</h2>
        <p className="mb-4">{curso.comunidad.descripcion}</p>
        <div className="flex gap-4">
          {curso.comunidad.links.map((link, idx) => (
            <button key={idx} className={`px-4 py-2 rounded-full font-semibold text-white bg-${link.color}-500`}>{link.texto}</button>
          ))}
        </div>
      </section>

      {/* Eventos */}
      <section className="eventos mb-10">
        <h2 className="text-2xl font-bold mb-4">Eventos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {curso.eventos.map((ev, idx) => (
            <div key={idx} className="bg-neutral-900 rounded-xl p-6 flex flex-col gap-2">
              <div className="font-bold text-lg">{ev.titulo}</div>
              <div>{ev.dia} {ev.hora} - {ev.plataforma}</div>
              <button className="bg-white text-black px-4 py-1 rounded-full font-semibold">Unirse</button>
            </div>
          ))}
        </div>
      </section>

      {/* Certificación */}
      <section className="certificacion mb-10">
        <h2 className="text-2xl font-bold mb-4">{curso.certificacion.titulo}</h2>
        <button className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold">{curso.certificacion.boton}</button>
      </section>
    </div>
  );
};

export default CursoDetalle; 