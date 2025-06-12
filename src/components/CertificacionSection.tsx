import React from "react";

interface Alianza {
  logo: string;
  nombre: string;
  url: string;
}

interface CertificacionSectionProps {
  videoUrl?: string; // URL de video (YouTube, Vimeo, etc.) o imagen
  onCertificar: () => void; // Función al hacer click en "Quiero certificarme"
  certificadoImg?: string; // Imagen de previsualización del certificado (opcional)
  alianzas?: Alianza[]; // Array de alianzas
  mensajeMotivador?: string;
  mensajeSecundario?: string;
  textoBoton?: string;
  notaImportante?: string;
}

const CertificacionSection: React.FC<CertificacionSectionProps> = ({
  videoUrl,
  onCertificar,
  certificadoImg,
  alianzas = [],
  mensajeMotivador = "¡Ha llegado el momento de certificarte!",
  mensajeSecundario = "Pero primero, mira este video:",
  textoBoton = "QUIERO CERTIFICARME",
  notaImportante = "Si también deseas reclamar el certificado de CEL, avalado por la Florida Global University, debes seguir las instrucciones al final del quiz para solicitarlo."
}) => (
  <section className="w-full flex flex-col items-center justify-center py-12 px-4 bg-black text-white">
    <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
      {mensajeMotivador}
    </h2>
    <p className="mb-6 text-lg text-center text-neutral-300">
      {mensajeSecundario}
    </p>

    {/* Video o imagen */}
    <div className="w-full max-w-3xl mb-8 rounded-lg overflow-hidden shadow-lg bg-neutral-900 flex items-center justify-center aspect-video">
      {videoUrl ? (
        videoUrl.includes("youtube") || videoUrl.includes("vimeo") ? (
          <iframe
            src={videoUrl}
            title="Video de certificación"
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <img src={videoUrl} alt="Certificación" className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-neutral-500">
          Aquí irá tu video o imagen motivacional
        </div>
      )}
    </div>

    {/* Mensaje y botón */}
    <p className="mb-4 text-xl text-center">
      Completa el quiz a continuación para reclamar tu certificado:
    </p>
    <button
      onClick={onCertificar}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 mb-8 transition"
    >
      <span>🚀</span> {textoBoton}
    </button>

    {/* Imagen de certificado (opcional) */}
    {certificadoImg && (
      <div className="mb-8">
        <img src={certificadoImg} alt="Previsualización del certificado" className="max-w-xs rounded shadow-lg mx-auto" />
      </div>
    )}

    {/* Nota importante */}
    <p className="text-sm text-neutral-400 mb-8 max-w-2xl text-center">
      <b>Importante:</b> {notaImportante}
    </p>

    {/* Alianzas */}
    {alianzas.length > 0 && (
      <div className="flex flex-col items-center gap-2">
        <span className="text-neutral-400 text-xs mb-2">En alianza con:</span>
        <div className="flex flex-wrap gap-6 items-center justify-center">
          {alianzas.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
              <img src={a.logo} alt={a.nombre} className="h-12 mb-1" />
              <span className="text-xs text-neutral-300">{a.nombre}</span>
            </a>
          ))}
        </div>
      </div>
    )}
  </section>
);

export default CertificacionSection; 