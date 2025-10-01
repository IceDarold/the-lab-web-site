import { useEffect, useRef } from "react";
import { initFluid } from "../../lib/initFluid";

const FLUID_CONFIG = {
  TRANSPARENT: true,
  BACK_COLOR: { r: 2, g: 4, b: 12 },
  COLORFUL: true,
  DYE_RESOLUTION: 640,
  SIM_RESOLUTION: 128,
  BLOOM: true,
  BLOOM_INTENSITY: 0.7,
  BLOOM_THRESHOLD: 0.5,
  SUNRAYS: true,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 18,
  CURL: 28,
  SPLAT_FORCE: 7000,
  SPLAT_RADIUS: 0.18,
};

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") {
      console.warn("Fluid background: window or canvas not ready yet");
      return;
    }

    console.log("Fluid background: canvas element found", canvas);

    let dispose: (() => void) | undefined;

    try {
      console.info("Fluid background: initialising simulation", FLUID_CONFIG);
      dispose = initFluid(canvas, {
        config: FLUID_CONFIG,
        enableGui: false,
        assetsBasePath: "/fluid/",
      });
      console.info("Fluid background: simulation initialised successfully");
    } catch (error) {
      console.error("Fluid background: failed to initialise", error);
      console.error("Fluid background: error stack", error.stack);
    }

    return () => {
      dispose?.();
      console.info("Fluid background: disposed");
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
