import { useEffect, useRef } from "react";
import { initFluid } from "../../fluid/initFluid";
import { FLUID_CONFIG } from "./fluidConfig";

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (FLUID_CONFIG.DISABLED) {
      console.info("Fluid background: disabled");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") {
      console.warn("Fluid background: window or canvas not ready yet");
      return;
    }

    let dispose: (() => void) | undefined;

    try {
      console.info("Fluid background: initialising simulation", FLUID_CONFIG);
      dispose = initFluid(canvas, {
        config: FLUID_CONFIG,
        enableGui: false,
        assetsBasePath: "/fluid/",
      });
      console.info("Fluid background: simulation initialised");
    } catch (error) {
      console.error("Fluid background: failed to initialise", error);
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
