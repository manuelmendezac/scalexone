import { useState } from 'react';
import useNeuroState from '../store/useNeuroState';

interface LeadFormProps {
  onSuccess: () => void;
}

const LeadForm = ({ onSuccess }: LeadFormProps) => {
  const { updateUserInfo } = useNeuroState();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Actualizar estado global
    updateUserInfo(formData);
    onSuccess();
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl">
      <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-6">
        Únete a NeuroLink AI
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-neurolink-coldWhite mb-2">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-neurolink-coldWhite mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-neurolink-cyberBlue border-t-transparent rounded-full animate-spin"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            'Comenzar'
          )}
        </button>
      </form>
    </div>
  );
};

export default LeadForm; 