import React from 'react';
import Image from 'next/image';

interface LandingBePartnexProps {
  // Hero Section
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  heroImage: string;
  
  // Beneficios
  benefits: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  
  // Resultados
  results: {
    title: string;
    items: Array<{
      number: string;
      label: string;
    }>;
  };
  
  // Testimonios
  testimonials: Array<{
    name: string;
    role: string;
    company: string;
    content: string;
    avatar: string;
  }>;
  
  // CTA Final
  finalCta: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  
  // Footer
  footer: {
    logo: string;
    links: Array<{
      title: string;
      items: Array<{
        text: string;
        href: string;
      }>;
    }>;
    socialLinks: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
  };
}

const LandingBePartnex: React.FC<LandingBePartnexProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  heroImage,
  benefits,
  results,
  testimonials,
  finalCta,
  footer
}) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenido del Hero */}
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {title}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {subtitle}
              </p>
              <a
                href={ctaLink}
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                {ctaText}
              </a>
            </div>
            
            {/* Imagen del Hero */}
            <div className="relative">
              <div className="relative w-full h-[500px]">
                <Image
                  src={heroImage}
                  alt={title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-20 bg-gray-50">
        {/* Aquí irá el contenido de Beneficios */}
      </section>

      {/* Resultados Section */}
      <section className="py-20">
        {/* Aquí irá el contenido de Resultados */}
      </section>

      {/* Testimonios Section */}
      <section className="py-20 bg-gray-50">
        {/* Aquí irá el contenido de Testimonios */}
      </section>

      {/* CTA Final Section */}
      <section className="py-20">
        {/* Aquí irá el contenido del CTA Final */}
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        {/* Aquí irá el contenido del Footer */}
      </footer>
    </div>
  );
};

export default LandingBePartnex; 