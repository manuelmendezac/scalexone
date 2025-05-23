import React from 'react';

interface TipsCarouselProps {
  news: string[];
}

const TipsCarousel: React.FC<TipsCarouselProps> = ({ news }) => (
  <div className="mb-6">
    <div className="text-cyan-300 font-semibold mb-2">Novedades y Tips</div>
    <div className="flex gap-4 overflow-x-auto pb-2">
      {news.map((n, i) => (
        <div key={i} className="min-w-[220px] bg-gray-800 rounded-xl p-4 shadow hover:shadow-cyan-400/30 transition text-white text-sm font-medium animate-fade-in">
          {n}
        </div>
      ))}
    </div>
  </div>
);

export default TipsCarousel; 