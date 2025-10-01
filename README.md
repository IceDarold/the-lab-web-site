# The Lab Web Site

Репозиторий содержит WebGL-симуляцию жидкости, выделенную в модуль для переиспользования в других проектах (включая React), а также пример React-компонента фонового эффекта.

## Структура

- `script.js` — оригинальная автономная версия симуляции для HTML-страницы.
- `src/fluid/initFluid.js` — модуль с функцией `initFluid`, который получает канвас извне и возвращает функцию очистки.
- `src/components/FluidBackground.tsx` — React-компонент, подключающий симуляцию как фиксированный фон.
- `src/App.tsx`, `src/main.tsx` — пример приложения, показывающий, как использовать фон внутри React.

## Использование модуля

```js
import { initFluid } from './src/fluid/initFluid';

const canvas = document.querySelector('canvas');
const dispose = initFluid(canvas, {
  config: {
    TRANSPARENT: true,
    BACK_COLOR: { r: 10, g: 10, b: 30 },
  },
  enableGui: false,
});

// Вызовите dispose() при размонтировании, чтобы снять обработчики и остановить анимацию.
```

Опции:

- `config` — частичное переопределение настроек симуляции (`SIM_RESOLUTION`, `DYE_RESOLUTION`, `BLOOM`, `SUNRAYS`, и т.д.).
- `enableGui` — включает dat.GUI-панель (требует передачи `dat`).
- `dat` — namespace библиотеки `dat.gui`, если панель нужна.
- `ga` — опциональный коллбэк для аналитики. По умолчанию используется заглушка.
- `assetsBasePath` / `ditherTexturePath` — позволяют изменить путь до текстуры `LDR_LLL1_0.png`.

Симуляция реагирует только на движение курсора: при перемещении мыши поверх страницы генерируются завихрения, клики не требуются.

## Интеграция с React

```tsx
import { useEffect, useRef } from 'react';
import { initFluid } from './fluid/initFluid';

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const dispose = initFluid(canvasRef.current, { enableGui: false, config: { TRANSPARENT: true } });
    return () => dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1 }}
    />
  );
}
```

Пример готового компонента находится в `src/components/FluidBackground.tsx`. Его достаточно импортировать и разместить в корневом layout-е перед основным контентом.

## Очистка и безопасность

- `initFluid` возвращает `dispose()`, который снимает listeners и останавливает `requestAnimationFrame`. Вызывайте его при размонтировании компонента.
- Канвас имеет `pointer-events: none`, поэтому не блокирует взаимодействие с контентом сайта.
- Для снижения нагрузки на слабых устройствах уменьшите `DYE_RESOLUTION`, `SIM_RESOLUTION` и отключите `BLOOM`/`SUNRAYS` в конфиге.

## Лицензия

MIT License. Исходная работа принадлежит Pavel Dobryakov.
