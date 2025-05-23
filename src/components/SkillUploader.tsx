import { useState } from 'react';
import useNeuroState from '../store/useNeuroState';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfessionalProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  keySkills: string[];
  suggestedBooks: string[];
  faqs: { question: string; answer: string; }[];
}

const professionalProfiles: ProfessionalProfile[] = [
  {
    id: 'marketing',
    name: 'Marketing Digital',
    description: 'Especialista en estrategias digitales, SEO, SEM, redes sociales y análisis de datos.',
    icon: '📱',
    keySkills: [
      'SEO y SEM',
      'Análisis de métricas',
      'Gestión de redes sociales',
      'Content Marketing',
      'Email Marketing'
    ],
    suggestedBooks: [
      'Traction - Gabriel Weinberg',
      'Growth Hacker Marketing - Ryan Holiday',
      'Contagious - Jonah Berger'
    ],
    faqs: [
      {
        question: '¿Cómo optimizar el ROI en campañas digitales?',
        answer: 'Mediante análisis de métricas clave, segmentación precisa y optimización continua.'
      },
      {
        question: '¿Qué estrategias son más efectivas para engagement?',
        answer: 'Contenido de valor, interacción personalizada y análisis de comportamiento del usuario.'
      }
    ]
  },
  {
    id: 'finanzas',
    name: 'Inversiones y Finanzas',
    description: 'Experto en mercados financieros, análisis técnico, gestión de portafolios y finanzas personales.',
    icon: '💰',
    keySkills: [
      'Análisis fundamental',
      'Gestión de riesgos',
      'Mercados emergentes',
      'Finanzas personales',
      'Criptomonedas'
    ],
    suggestedBooks: [
      'The Intelligent Investor - Benjamin Graham',
      'Rich Dad Poor Dad - Robert Kiyosaki',
      'A Random Walk Down Wall Street - Burton Malkiel'
    ],
    faqs: [
      {
        question: '¿Cómo diversificar una cartera de inversión?',
        answer: 'Combinando diferentes clases de activos, sectores y regiones geográficas.'
      },
      {
        question: '¿Qué indicadores son clave para el análisis técnico?',
        answer: 'RSI, MACD, medias móviles y volumen de trading.'
      }
    ]
  },
  {
    id: 'bienes-raices',
    name: 'Bienes Raíces',
    description: 'Conocimiento en valuación, desarrollo inmobiliario, inversiones y gestión de propiedades.',
    icon: '🏢',
    keySkills: [
      'Valuación inmobiliaria',
      'Desarrollo de proyectos',
      'Gestión de propiedades',
      'Financiamiento',
      'Análisis de mercado'
    ],
    suggestedBooks: [
      'The Millionaire Real Estate Investor - Gary Keller',
      'The ABCs of Real Estate Investing - Ken McElroy',
      'Building Wealth One House at a Time - John Schaub'
    ],
    faqs: [
      {
        question: '¿Cómo evaluar una oportunidad inmobiliaria?',
        answer: 'Analizando ubicación, potencial de plusvalía, rentabilidad y riesgos asociados.'
      },
      {
        question: '¿Qué estrategias son mejores para inversión?',
        answer: 'Comprar bajo, renovar, rentar o vender según el mercado y objetivos.'
      }
    ]
  },
  {
    id: 'ia',
    name: 'Inteligencia Artificial',
    description: 'Especialista en machine learning, deep learning, procesamiento de lenguaje natural y visión por computadora.',
    icon: '🤖',
    keySkills: [
      'Machine Learning',
      'Deep Learning',
      'NLP',
      'Computer Vision',
      'Ética en IA'
    ],
    suggestedBooks: [
      'Deep Learning - Ian Goodfellow',
      'Artificial Intelligence: A Modern Approach - Stuart Russell',
      'Hands-On Machine Learning - Aurélien Géron'
    ],
    faqs: [
      {
        question: '¿Cómo empezar en machine learning?',
        answer: 'Dominando fundamentos matemáticos, Python y frameworks como TensorFlow o PyTorch.'
      },
      {
        question: '¿Qué aplicaciones tiene la IA en la actualidad?',
        answer: 'Desde asistentes virtuales hasta diagnóstico médico y vehículos autónomos.'
      }
    ]
  },
  {
    id: 'medicina-holistica',
    name: 'Medicina Holística',
    description: 'Enfoque integral de la salud, combinando medicina tradicional y terapias alternativas.',
    icon: '🌿',
    keySkills: [
      'Medicina integrativa',
      'Nutrición holística',
      'Terapias alternativas',
      'Bienestar mental',
      'Medicina preventiva'
    ],
    suggestedBooks: [
      'The Web That Has No Weaver - Ted Kaptchuk',
      'Integrative Medicine - David Rakel',
      'The Healing Power of Nature - Andrew Weil'
    ],
    faqs: [
      {
        question: '¿Cómo integrar medicina tradicional y alternativa?',
        answer: 'Combinando evidencia científica con enfoques holísticos personalizados.'
      },
      {
        question: '¿Qué rol juega la nutrición en la salud holística?',
        answer: 'Es fundamental para el equilibrio del cuerpo, mente y energía vital.'
      }
    ]
  },
  {
    id: 'coaching',
    name: 'Coaching y Mentoría',
    description: 'Experto en desarrollo personal, liderazgo, y transformación organizacional.',
    icon: '🎯',
    keySkills: [
      'Coaching ejecutivo',
      'Desarrollo de liderazgo',
      'Inteligencia emocional',
      'Gestión del cambio',
      'Mentoría'
    ],
    suggestedBooks: [
      'Coaching for Performance - John Whitmore',
      'The Coaching Habit - Michael Bungay Stanier',
      'Start with Why - Simon Sinek'
    ],
    faqs: [
      {
        question: '¿Cómo estructurar una sesión de coaching efectiva?',
        answer: 'Estableciendo objetivos claros, usando preguntas poderosas y creando planes de acción.'
      },
      {
        question: '¿Qué diferencia coaching de mentoría?',
        answer: 'El coaching se enfoca en el presente y futuro, mientras la mentoría comparte experiencia pasada.'
      }
    ]
  },
  {
    id: 'software',
    name: 'Programación / Ingeniería de Software',
    description: 'Desarrollo de software, arquitectura de sistemas, patrones de diseño y mejores prácticas.',
    icon: '💻',
    keySkills: [
      'Arquitectura de software',
      'Patrones de diseño',
      'Metodologías ágiles',
      'DevOps',
      'Cloud Computing'
    ],
    suggestedBooks: [
      'Clean Code - Robert C. Martin',
      'Design Patterns - Gang of Four',
      'The Pragmatic Programmer - Andrew Hunt'
    ],
    faqs: [
      {
        question: '¿Cómo mantener código limpio y mantenible?',
        answer: 'Siguiendo principios SOLID, escribiendo tests y documentando adecuadamente.'
      },
      {
        question: '¿Qué metodologías ágiles son más efectivas?',
        answer: 'Scrum para equipos pequeños, Kanban para flujos continuos, y DevOps para integración.'
      }
    ]
  },
  {
    id: 'educacion',
    name: 'Educación / Docencia',
    description: 'Pedagogía, diseño instruccional, metodologías de enseñanza y tecnologías educativas.',
    icon: '📚',
    keySkills: [
      'Diseño instruccional',
      'Pedagogía digital',
      'Evaluación educativa',
      'Gamificación',
      'Aprendizaje adaptativo'
    ],
    suggestedBooks: [
      'Make It Stick - Peter C. Brown',
      'The Art of Learning - Josh Waitzkin',
      'Mindstorms - Seymour Papert'
    ],
    faqs: [
      {
        question: '¿Cómo implementar aprendizaje personalizado?',
        answer: 'Usando tecnología adaptativa, análisis de datos y metodologías flexibles.'
      },
      {
        question: '¿Qué rol juega la tecnología en la educación moderna?',
        answer: 'Facilita el acceso, personalización y colaboración en el aprendizaje.'
      }
    ]
  },
  {
    id: 'filosofia',
    name: 'Filosofía / Desarrollo Humano',
    description: 'Pensamiento crítico, ética, lógica y teoría del conocimiento aplicados al desarrollo personal.',
    icon: '🤔',
    keySkills: [
      'Pensamiento crítico',
      'Ética aplicada',
      'Lógica formal',
      'Teoría del conocimiento',
      'Desarrollo personal'
    ],
    suggestedBooks: [
      'Meditations - Marcus Aurelius',
      'The Republic - Plato',
      'Man\'s Search for Meaning - Viktor Frankl'
    ],
    faqs: [
      {
        question: '¿Cómo aplicar la filosofía en la vida diaria?',
        answer: 'Desarrollando pensamiento crítico, reflexión ética y búsqueda de significado.'
      },
      {
        question: '¿Qué corrientes filosóficas son relevantes hoy?',
        answer: 'Existencialismo, estoicismo y filosofía práctica para el desarrollo personal.'
      }
    ]
  },
  {
    id: 'arte',
    name: 'Creatividad y Arte',
    description: 'Desarrollo de habilidades creativas, diseño, expresión artística y pensamiento innovador.',
    icon: '🎨',
    keySkills: [
      'Diseño creativo',
      'Pensamiento divergente',
      'Expresión artística',
      'Innovación',
      'Storytelling'
    ],
    suggestedBooks: [
      'The War of Art - Steven Pressfield',
      'Steal Like an Artist - Austin Kleon',
      'Creative Confidence - Tom Kelley'
    ],
    faqs: [
      {
        question: '¿Cómo superar bloqueos creativos?',
        answer: 'Estableciendo rutinas, buscando inspiración diversa y practicando regularmente.'
      },
      {
        question: '¿Qué técnicas fomentan la creatividad?',
        answer: 'Mind mapping, brainstorming, y exposición a diferentes disciplinas artísticas.'
      }
    ]
  },
  {
    id: 'startups',
    name: 'Startups y Emprendimiento',
    description: 'Desarrollo de negocios, innovación, gestión de startups y estrategias de crecimiento.',
    icon: '🚀',
    keySkills: [
      'Validación de ideas',
      'Lean Startup',
      'Growth Hacking',
      'Pitch Deck',
      'Financiamiento'
    ],
    suggestedBooks: [
      'The Lean Startup - Eric Ries',
      'Zero to One - Peter Thiel',
      'The Hard Thing About Hard Things - Ben Horowitz'
    ],
    faqs: [
      {
        question: '¿Cómo validar una idea de negocio?',
        answer: 'Realizando investigación de mercado, prototipos y pruebas con usuarios reales.'
      },
      {
        question: '¿Qué métricas son clave para startups?',
        answer: 'CAC, LTV, burn rate, y tasa de crecimiento mes a mes.'
      }
    ]
  }
];

const SkillUploader = () => {
  const { userProfile, addSkill, addKnowledgeSource } = useNeuroState();
  const [selectedProfile, setSelectedProfile] = useState<ProfessionalProfile | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showFaqs, setShowFaqs] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.name.split('.').pop()?.toLowerCase();

        if (!['pdf', 'txt', 'md'].includes(fileType || '')) {
          throw new Error('Formato de archivo no soportado. Use PDF, TXT o MD.');
        }

        const content = await file.text();
        
        // Agregar como fuente de conocimiento
        addKnowledgeSource({
          id: Date.now().toString(),
          name: file.name,
          type: fileType as 'pdf' | 'txt' | 'md',
          content,
          category: selectedProfile?.id || 'general',
          uploadDate: new Date().toISOString()
        });

        // Si hay un perfil seleccionado, agregar sus habilidades
        if (selectedProfile) {
          selectedProfile.keySkills.forEach(skill => {
            addSkill({
              id: `${selectedProfile.id}-${skill.toLowerCase().replace(/\s+/g, '-')}`,
              name: skill,
              category: selectedProfile.id,
              level: 'beginner',
              description: `Habilidad en ${skill} para el perfil de ${selectedProfile.name}`,
              resources: selectedProfile.suggestedBooks
            });
          });
        }
      }

      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al cargar el archivo');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-8">
        <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-6">
          Personaliza tu Clon IA
        </h2>

        {/* Selector de Perfiles */}
        <div className="mb-8">
          <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
            Selecciona tu Perfil Profesional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionalProfiles.map((profile) => (
              <motion.button
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  selectedProfile?.id === profile.id
                    ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue/10'
                    : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{profile.icon}</span>
                  <span className="font-futuristic text-neurolink-coldWhite">
                    {profile.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detalles del Perfil Seleccionado */}
        <AnimatePresence mode="wait">
          {selectedProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-futuristic text-neurolink-coldWhite">
                    {selectedProfile.name}
                  </h4>
                  <p className="text-neurolink-coldWhite/80 mt-2">
                    {selectedProfile.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowFaqs(!showFaqs)}
                  className="text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite transition-colors"
                >
                  {showFaqs ? 'Ocultar FAQs' : 'Ver FAQs'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-futuristic text-neurolink-coldWhite mb-2">
                    Habilidades Clave:
                  </h5>
                  <ul className="list-disc list-inside text-neurolink-coldWhite/60 space-y-1">
                    {selectedProfile.keySkills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-futuristic text-neurolink-coldWhite mb-2">
                    Libros Recomendados:
                  </h5>
                  <ul className="list-disc list-inside text-neurolink-coldWhite/60 space-y-1">
                    {selectedProfile.suggestedBooks.map((book, index) => (
                      <li key={index}>{book}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FAQs */}
              <AnimatePresence>
                {showFaqs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <h5 className="font-futuristic text-neurolink-coldWhite">
                      Preguntas Frecuentes:
                    </h5>
                    {selectedProfile.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-neurolink-background/30 border border-neurolink-cyberBlue/20"
                      >
                        <h6 className="font-futuristic text-neurolink-coldWhite mb-2">
                          {faq.question}
                        </h6>
                        <p className="text-neurolink-coldWhite/60">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploader de Archivos */}
        <div className="space-y-4">
          <h3 className="text-xl font-futuristic text-neurolink-coldWhite">
            Carga Conocimientos Personalizados
          </h3>
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-neurolink-cyberBlue/30 rounded-lg cursor-pointer hover:border-neurolink-cyberBlue/60 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-neurolink-coldWhite/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-neurolink-coldWhite/60">
                  <span className="font-futuristic">Haz clic para cargar</span> o arrastra y suelta
                </p>
                <p className="text-xs text-neurolink-coldWhite/40">
                  PDF, TXT o MD (máx. 10MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Estado de Carga */}
          <AnimatePresence mode="wait">
            {uploadStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg ${
                  uploadStatus === 'success'
                    ? 'bg-green-500/20 border-green-500/30'
                    : uploadStatus === 'error'
                    ? 'bg-red-500/20 border-red-500/30'
                    : 'bg-neurolink-cyberBlue/20 border-neurolink-cyberBlue/30'
                } border`}
              >
                {uploadStatus === 'uploading' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-neurolink-cyberBlue border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-neurolink-coldWhite">Cargando archivos...</span>
                  </div>
                )}
                {uploadStatus === 'success' && (
                  <span className="text-green-400">¡Archivos cargados exitosamente!</span>
                )}
                {uploadStatus === 'error' && (
                  <span className="text-red-400">{errorMessage}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SkillUploader; 