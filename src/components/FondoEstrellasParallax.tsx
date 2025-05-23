import React, { useRef, useEffect } from 'react';

const NUM_ESTRELLAS = 110;
const CAPAS = 2;
const COLORES = ['#eaf6ff', '#b6cfff'];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function FondoEstrellasParallax() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const estrellas = useRef<any[]>([]);
  const parallax = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Inicializar estrellas
    estrellas.current = Array.from({ length: NUM_ESTRELLAS }).map(() => {
      const capa = Math.floor(random(0, CAPAS));
      return {
        x: random(0, width),
        y: random(0, height),
        r: random(0.3, 1.1 + capa * 0.2),
        speed: random(0.02 + capa * 0.02, 0.06 + capa * 0.03),
        capa,
        color: COLORES[capa],
        alpha: random(0.3, 0.7),
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      };
    });

    let animId: number;
    function animate() {
      ctx!.fillStyle = '#07091a';
      ctx!.fillRect(0, 0, width, height);
      for (const star of estrellas.current) {
        star.alpha += star.alphaDir * 0.002 * (1 + star.capa * 0.1);
        if (star.alpha > 0.7) { star.alpha = 0.7; star.alphaDir = -1; }
        if (star.alpha < 0.2) { star.alpha = 0.2; star.alphaDir = 1; }
        star.x += star.speed * (1 + star.capa * 0.3) + parallax.current.x * (0.06 + star.capa * 0.03);
        star.y += parallax.current.y * (0.04 + star.capa * 0.02);
        if (star.x > width + 5) star.x = -5;
        if (star.x < -5) star.x = width + 5;
        if (star.y > height + 5) star.y = -5;
        if (star.y < -5) star.y = height + 5;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx!.fillStyle = star.color;
        ctx!.globalAlpha = star.alpha;
        ctx!.shadowColor = star.color;
        ctx!.shadowBlur = 4 - star.capa * 1.5;
        ctx!.fill();
        ctx!.globalAlpha = 1;
        ctx!.shadowBlur = 0;
      }
      animId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', handleResize);

    function handleMove(e: MouseEvent | TouchEvent) {
      let x = 0, y = 0;
      if (e instanceof MouseEvent) {
        x = (e.clientX / width - 0.5) * 2;
        y = (e.clientY / height - 0.5) * 2;
      } else if (e.touches && e.touches[0]) {
        x = (e.touches[0].clientX / width - 0.5) * 2;
        y = (e.touches[0].clientY / height - 0.5) * 2;
      }
      parallax.current.x = x;
      parallax.current.y = y;
    }
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-full min-h-screen -z-10"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100%', minHeight: '100vh', zIndex: -10 }}
      aria-hidden="true"
    />
  );
} 