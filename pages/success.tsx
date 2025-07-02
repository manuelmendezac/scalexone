import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Simulación de consulta a Stripe/backend (en producción, deberías hacer un fetch real)
async function fetchSessionDetails(session_id: string) {
  // Aquí deberías consultar tu backend o Stripe para obtener detalles reales
  // Simulación:
  return {
    tipo: 'curso', // o 'servicio'
    nombre: 'Curso de Alto Impacto',
    cursoId: 'curso-123',
    servicio: null,
  };
}

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [detalles, setDetalles] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      fetchSessionDetails(session_id as string).then((data) => {
        setDetalles(data);
        setLoading(false);
      });
    }
  }, [session_id]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', color: '#FFD700' }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>¡Felicidades, has dado el primer paso!</h1>
      <p style={{ fontSize: 22, color: '#fff', maxWidth: 500, textAlign: 'center', marginBottom: 32 }}>
        Tu pago fue procesado con éxito. <br />
        <b>¡Bienvenido a la comunidad de creadores de alto impacto!</b>
      </p>
      {loading && <p style={{ color: '#fff' }}>Cargando detalles de tu compra...</p>}
      {!loading && detalles?.tipo === 'curso' && (
        <>
          <p style={{ color: '#fff', marginBottom: 24 }}>
            Ya tienes acceso al curso <b>{detalles.nombre}</b>.<br />
            ¡Prepárate para transformar tu aprendizaje!
          </p>
          <Link href="/classroom">
            <button style={{ background: 'linear-gradient(90deg, #FFD700 0%, #FFB300 100%)', color: '#222', fontWeight: 700, border: 'none', borderRadius: 8, padding: '16px 32px', fontSize: 20, cursor: 'pointer', marginBottom: 16 }}>
              Ir a la Zona de Cursos
            </button>
          </Link>
        </>
      )}
      {!loading && detalles?.tipo === 'servicio' && (
        <>
          <p style={{ color: '#fff', marginBottom: 24 }}>
            Hemos recibido tu solicitud de servicio. <br />
            <b>¡Nuestro equipo se pondrá en contacto contigo por correo o WhatsApp!</b>
          </p>
          <p style={{ color: '#FFD700', fontWeight: 600, marginBottom: 16 }}>
            Por favor, asegúrate de tener tu información de perfil actualizada para agilizar el proceso.
          </p>
          <Link href="/configuracion">
            <button style={{ background: 'linear-gradient(90deg, #FFD700 0%, #FFB300 100%)', color: '#222', fontWeight: 700, border: 'none', borderRadius: 8, padding: '16px 32px', fontSize: 20, cursor: 'pointer' }}>
              Completar mi perfil
            </button>
          </Link>
        </>
      )}
      <div style={{ marginTop: 48, color: '#FFD700', fontSize: 18, opacity: 0.7 }}>
        <b>ScaleXone</b> · El futuro es de los creadores integrales 🚀
      </div>
    </div>
  );
} 