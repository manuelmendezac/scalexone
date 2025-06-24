import React from 'react';

interface TipsCarouselProps {
  news: string[];
}

const TipsCarousel: React.FC<TipsCarouselProps> = ({ news }) => (
  <div className="mb-6">
    <div className="font-semibold mb-2" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }}>Novedades y Tips</div>
    <div className="flex gap-4 overflow-x-auto pb-2">
      {news.map((n, i) => (
        <div key={i} className="min-w-[220px] rounded-xl p-4 shadow transition text-yellow-100 text-sm font-medium animate-fade-in" style={{ background: '#18181b', border: '1.5px solid #FFD700', boxShadow: '0 2px 12px #FFD70044' }}>
          {n}
        </div>
      ))}
    </div>
  </div>
);

export default TipsCarousel; 