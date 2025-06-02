import React from "react";

interface LandingSenalesProProps {
  logo: string;
  title: string;
  subtitle: string;
  button1Text: string;
  button1Link: string;
  button2Text: string;
  button2Link: string;
  // Puedes agregar más props para más botones/enlaces aquí
}

const LandingSenalesPro: React.FC<LandingSenalesProProps> = ({
  logo,
  title,
  subtitle,
  button1Text,
  button1Link,
  button2Text,
  button2Link,
}) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <img src={logo} alt="Logo" className="h-20 mb-6" />
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">{title}</h1>
      <h2 className="text-xl md:text-2xl font-light mb-8 text-center">{subtitle}</h2>
      <div className="flex gap-4 mb-12">
        <a href={button1Link} className="bg-lime-400 text-black px-6 py-3 rounded font-bold hover:bg-lime-300 transition">{button1Text}</a>
        <a href={button2Link} className="bg-gray-800 text-white px-6 py-3 rounded font-bold hover:bg-gray-700 transition">{button2Text}</a>
      </div>
      {/* --- AVANCE ACTUAL --- */}
      {/* Aquí comienza la conversión del HTML a JSX. Puedes seguir pegando y adaptando el resto de la landing aquí. */}
      {/* Ejemplo de sección adicional: */}
      {/* <section className="w-full max-w-4xl bg-gray-900 rounded-xl p-8 mb-8"> */}
      {/*   <h3 className="text-2xl font-bold mb-4">Otra sección de la landing</h3> */}
      {/*   <p>Contenido estático o más botones personalizables...</p> */}
      {/* </section> */}
      {/* --- FIN AVANCE ACTUAL --- */}
    </div>
  );
};

export default LandingSenalesPro; 