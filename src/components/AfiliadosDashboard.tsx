import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useNeuroState from '../store/useNeuroState';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Referido {
  id: string;
  nombre: string;
  email: string;
  fechaRegistro: string;
  montoGenerado: number;
}

const AfiliadosDashboard = () => {
  const { userName } = useNeuroState();
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const itemsPerPage = 5;

  // Datos de ejemplo
  const totalGanado = 1250.75;
  const referidosActivos = 8;
  const comisionesPorCobrar = 350.25;

  const referidos: Referido[] = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      fechaRegistro: '2024-03-15',
      montoGenerado: 150.00
    },
    {
      id: '2',
      nombre: 'María García',
      email: 'maria@email.com',
      fechaRegistro: '2024-03-14',
      montoGenerado: 200.00
    },
    // ... más referidos
  ];

  // Datos para el gráfico de barras
  const barChartData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Ingresos por Semana',
        data: [300, 450, 280, 220],
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderColor: 'rgba(0, 255, 0, 1)',
        borderWidth: 1
      }
    ]
  };

  // Datos para el gráfico circular
  const pieChartData = {
    labels: ['Premium', 'Pro', 'Enterprise'],
    datasets: [
      {
        data: [40, 35, 25],
        backgroundColor: [
          'rgba(0, 255, 0, 0.2)',
          'rgba(0, 150, 255, 0.2)',
          'rgba(255, 255, 255, 0.2)'
        ],
        borderColor: [
          'rgba(0, 255, 0, 1)',
          'rgba(0, 150, 255, 1)',
          'rgba(255, 255, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const handleCopyLink = async () => {
    const link = `https://neurolink.ai/?ref=${userName}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const totalPages = Math.ceil(referidos.length / itemsPerPage);
  const paginatedReferidos = referidos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-8">
        <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-8">
          Dashboard de Afiliados
        </h2>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border border-neurolink-cyberBlue/30 rounded-lg">
            <h3 className="text-lg font-futuristic text-neurolink-coldWhite/80 mb-2">
              Total Ganado
            </h3>
            <p className="text-3xl text-neurolink-matrixGreen">
              ${totalGanado.toFixed(2)}
            </p>
          </div>
          
          <div className="p-6 border border-neurolink-cyberBlue/30 rounded-lg">
            <h3 className="text-lg font-futuristic text-neurolink-coldWhite/80 mb-2">
              Referidos Activos
            </h3>
            <p className="text-3xl text-neurolink-matrixGreen">
              {referidosActivos}
            </p>
          </div>
          
          <div className="p-6 border border-neurolink-cyberBlue/30 rounded-lg">
            <h3 className="text-lg font-futuristic text-neurolink-coldWhite/80 mb-2">
              Comisiones por Cobrar
            </h3>
            <p className="text-3xl text-neurolink-matrixGreen">
              ${comisionesPorCobrar.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Generador de Link */}
        <div className="mb-8">
          <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
            Tu Link de Referido
          </h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={`https://neurolink.ai/?ref=${userName}`}
              readOnly
              className="flex-1 p-2 rounded-lg bg-black/30 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 hover:bg-neurolink-cyberBlue/30 transition-colors text-neurolink-coldWhite"
            >
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </div>

        {/* Tabla de Referidos */}
        <div className="mb-8">
          <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
            Referidos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-neurolink-coldWhite/80">
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReferidos.map((referido) => (
                  <tr key={referido.id} className="border-t border-neurolink-cyberBlue/30">
                    <td className="p-2 text-neurolink-coldWhite">{referido.nombre}</td>
                    <td className="p-2 text-neurolink-coldWhite/80">{referido.email}</td>
                    <td className="p-2 text-neurolink-coldWhite/80">{referido.fechaRegistro}</td>
                    <td className="p-2 text-right text-neurolink-matrixGreen">
                      ${referido.montoGenerado.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-neurolink-cyberBlue text-neurolink-coldWhite'
                    : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/80 hover:bg-neurolink-cyberBlue/30'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="p-4 border border-neurolink-cyberBlue/30 rounded-lg">
            <h3 className="text-lg font-futuristic text-neurolink-coldWhite mb-4">
              Ingresos por Semana
            </h3>
            <Bar data={barChartData} />
          </div>
          
          <div className="p-4 border border-neurolink-cyberBlue/30 rounded-lg">
            <h3 className="text-lg font-futuristic text-neurolink-coldWhite mb-4">
              Distribución de Comisiones
            </h3>
            <Pie data={pieChartData} />
          </div>
        </div>

        {/* Botón de Retiro */}
        <div className="flex justify-end">
          <button
            onClick={handleWithdraw}
            className="px-6 py-2 rounded-lg bg-neurolink-matrixGreen/20 hover:bg-neurolink-matrixGreen/30 transition-colors text-neurolink-coldWhite"
          >
            Solicitar Retiro
          </button>
        </div>

        {/* Toast de Confirmación */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 p-4 bg-neurolink-cyberBlue/90 text-neurolink-coldWhite rounded-lg shadow-lg"
            >
              Link copiado al portapapeles
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Retiro */}
        <AnimatePresence>
          {showWithdrawModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-neurolink-background p-6 rounded-xl border-2 border-neurolink-cyberBlue"
              >
                <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                  Solicitar Retiro
                </h3>
                <p className="text-neurolink-coldWhite/80 mb-4">
                  ¿Estás seguro de que deseas retirar ${comisionesPorCobrar.toFixed(2)}?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 hover:bg-neurolink-cyberBlue/30 transition-colors text-neurolink-coldWhite"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Aquí iría la lógica de retiro
                      setShowWithdrawModal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 hover:bg-neurolink-matrixGreen/30 transition-colors text-neurolink-coldWhite"
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AfiliadosDashboard; 