import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traducciones en español
const resources = {
  es: {
    translation: {
      // Navegación
      'nav.home': 'Inicio',
      'nav.dashboard': 'Dashboard',
      'nav.panel': 'Panel IA',
      'nav.niche': 'Nicho',
      'nav.upload': 'Cargar Docs',
      'nav.assistant': 'Asistente',
      'nav.simulation': 'Simulación IA',
      'nav.modules': 'Módulos',
      'nav.profile': 'Perfil',
      'nav.settings': 'Configuración',

      // Notificaciones
      'notifications.enable': 'Activar notificaciones',
      'notifications.permission.denied': 'Permiso denegado',
      'notifications.permission.granted': 'Notificaciones activadas',
      'notifications.new': 'Nueva notificación',

      // PWA
      'pwa.install': 'Instalar NeuroLink AI',
      'pwa.install.description': 'Instala NeuroLink AI en tu dispositivo para acceder rápidamente y disfrutar de una experiencia offline.',
      'pwa.install.button': 'Instalar',
      'pwa.install.later': 'Más tarde',

      // Onboarding
      'onboarding.welcome.title': 'Bienvenido al nacimiento de tu clon cognitivo',
      'onboarding.welcome.subtitle': '¿Cuál será su propósito principal?',
      'onboarding.purpose.business': 'Negocios',
      'onboarding.purpose.study': 'Estudio',
      'onboarding.purpose.productivity': 'Productividad',
      'onboarding.purpose.personal': 'Marca personal',
      'onboarding.purpose.other': 'Otra',
      'onboarding.name.title': 'Nombra a tu clon',
      'onboarding.name.placeholder': 'Escribe el nombre de tu clon...',
      'onboarding.name.continue': 'Continuar',
      'onboarding.personality.title': '¿Cómo quieres que interactúe tu clon?',
      'onboarding.personality.formal': 'Formal',
      'onboarding.personality.inspiring': 'Inspirador',
      'onboarding.personality.visionary': 'Visionario',
      'onboarding.personality.technical': 'Técnico',
      'onboarding.personality.coach': 'Coach',
      'onboarding.personality.friendly': 'Amigable',
      'onboarding.connections.title': 'Conexiones iniciales',
      'onboarding.connections.subtitle': 'Tu clon aprenderá de esto para responder mejor',
      'onboarding.connections.documents': 'Documentos',
      'onboarding.connections.notes': 'Notas personales',
      'onboarding.connections.calendar': 'Calendario',
      'onboarding.connections.browsing': 'Datos de navegación',
      'onboarding.connections.start': 'Iniciar entrenamiento',
      'onboarding.training.title': 'Sincronizando tu conocimiento...',
      'onboarding.complete.title': 'Tu clon está listo',
      'onboarding.complete.name': 'Nombre',
      'onboarding.complete.personality': 'Personalidad',
      'onboarding.complete.connections': 'Conexiones',
      'onboarding.complete.activate': 'Activar clon',

      // Mensajes generales
      'loading': 'Cargando...',
      'error': 'Ha ocurrido un error',
      'success': 'Operación exitosa',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 