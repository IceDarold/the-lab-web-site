import { FluidBackground } from './components/FluidBackground';

export function App() {
  return (
    <div style={{ position: 'relative', minHeight: '200vh' }}>
      <FluidBackground />
      <header style={{ padding: '4rem', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>The Lab</h1>
        <p style={{ fontSize: '1.25rem', maxWidth: 640, margin: '0 auto' }}>
          Двигай курсором по странице, чтобы создавать завихрения на фоне.
          Этот компонент можно разместить в любом React-проекте.
        </p>
      </header>
      <main style={{ padding: '0 1.5rem 6rem', maxWidth: 800, margin: '0 auto', color: '#fff' }}>
        <section style={{ marginBottom: '3rem' }}>
          <h2>Контент сайта</h2>
          <p>
            Содержимое страницы располагается поверх канваса. Канвас фиксирован и не
            перехватывает события, поэтому вся интерактивность остаётся доступной.
          </p>
        </section>
        <section>
          <h2>Настройка</h2>
          <p>
            Передайте кастомные параметры через prop <code>config</code>, чтобы изменить качество,
            цвета и пост-обработку эффекта.
          </p>
        </section>
      </main>
    </div>
  );
}
