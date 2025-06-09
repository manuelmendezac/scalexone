import React from 'react';
import AfiliadosLayout from '../../components/afiliados/AfiliadosLayout';

const ContactoIBPage = () => {
  return (
    <AfiliadosLayout>
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center py-8">
        <h2 className="text-3xl font-bold text-blue-900 font-orbitron tracking-wide mb-8 text-center">CONTÁCTENOS</h2>
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-stretch">
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <div className="text-xl font-bold text-blue-900 mb-2">MetaLink3 FZ-LLC</div>
            <div className="text-gray-700 text-sm mb-2">
              Compass Building, Al Shohada Road,<br />
              Al Hamra Industrial Zone-FZ, Ras Al Khaimah, UAE.<br />
              <span className="font-semibold">Commercial License:</span> 4701415.
            </div>
            <div className="flex items-center gap-2 text-blue-800 text-base">
              <span role="img" aria-label="phone">📞</span>
              <a href="https://wa.me/971585012722" target="_blank" rel="noopener noreferrer" className="hover:underline">+971 58 501 2722</a>
            </div>
            <div className="flex items-center gap-2 text-blue-800 text-base">
              <span role="img" aria-label="email">📧</span>
              <a href="mailto:info@scalexone.app" className="hover:underline">info@scalexone.app</a>
            </div>
            <div className="flex items-center gap-2 text-blue-800 text-base">
              <span role="img" aria-label="web">🌐</span>
              <a href="https://scalexone.app" target="_blank" rel="noopener noreferrer" className="hover:underline">https://scalexone.app</a>
            </div>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            <iframe
              title="Ubicación MetaLink3"
              src="https://www.google.com/maps?q=Compass+Building,+Al+Shohada+Road,+Al+Hamra+Industrial+Zone-FZ,+Ras+Al+Khaimah,+UAE&output=embed"
              width="100%"
              height="260"
              style={{ border: 0, borderRadius: '16px', minWidth: '220px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </AfiliadosLayout>
  );
};

export default ContactoIBPage; 