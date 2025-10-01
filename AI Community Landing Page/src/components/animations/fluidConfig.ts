export const FLUID_CONFIG = {
  DISABLED: false, // Полностью отключить эффект
  TRANSPARENT: false,
  BACK_COLOR: { r: 0, g: 0, b: 0 },
  COLORFUL: false,
  FIXED_HUE: 0.0328, // Значение от 0 до 1 для выбора цвета (0 - красный, 0.33 - зеленый, 0.66 - синий)
  DYE_RESOLUTION: 640,
  SIM_RESOLUTION: 128,
  BLOOM: false,
  BLOOM_INTENSITY: 0.3,
  BLOOM_THRESHOLD: 0.5,
  SUNRAYS: true,
  PRESSURE: 0,
  PRESSURE_ITERATIONS: 18,
  CURL: 0,
  SPLAT_FORCE: 5000,
  SPLAT_RADIUS: 0.18,
  AUTO_SPLATS_ENABLED: true, // Включить автоматические вспышки
  AUTO_SPLATS_INTERVAL: 3000, // Интервал в мс между автоматическими вспышками
  AUTO_SPLAT_FORCE: 1000, // Сила движения для автоматических вспышек
};