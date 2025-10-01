import { useEffect, useRef } from 'react';
import { initFluid } from '../fluid/initFluid';

type FluidBackgroundProps = {
  /**
   * Дополнительные CSS-классы для канваса.
   */
  className?: string;
  /**
   * Переопределение настроек симуляции.
   */
  config?: Parameters<typeof initFluid>[1]['config'];
};

/**
 * Полноэкранный фон с симуляцией жидкости.
 * Канвас фиксирован поверх страницы и пропускает клики.
 */
export function FluidBackground({ className, config }: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const dispose = initFluid(canvasRef.current, {
      config,
      enableGui: false,
    });

    return () => {
      dispose();
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
}
