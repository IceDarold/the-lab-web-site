# The Lab Web Site

Современный веб-сайт для сообщества The Lab - сообщества студентов и школьников, которые создают AI-проекты на практике.

## 📖 О проекте

The Lab - это сообщество, где молодые энтузиасты искусственного интеллекта могут развивать свои навыки через практические проекты. Сайт предоставляет информацию о сообществе, его подходе, преимуществах и способе присоединения.

### Структура сайта

- **Главная секция (Hero)**: Приветствие и призыв к действию
- **Подход (Approach)**: Описание методологии сообщества
- **Как это работает (How It Works)**: Процесс работы в сообществе
- **Активность (Activity)**: Примеры проектов и деятельности
- **Преимущества (Benefits)**: Что дает участие в сообществе
- **Форма заявки (Application Form)**: Возможность подать заявку на присоединение

## 🚀 Деплой на GitHub Pages

### Автоматический деплой с GitHub Actions

1. **Создайте репозиторий на GitHub**
   - Перейдите на [github.com](https://github.com) и создайте новый репозиторий
   - Рекомендуемое имя: `the-lab-web-site`

2. **Настройте локальный репозиторий**
   ```bash
   cd "the-lab-web-site"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Замените плейсхолдеры**
   - В `vite.config.ts` замените `/the-lab-web-site/` на `/YOUR_REPO_NAME/`
   - В `package.json` замените `https://username.github.io/the-lab-web-site` на `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

4. **Включите GitHub Pages**
   - Перейдите в Settings вашего репозитория
   - В разделе Pages выберите Source: "GitHub Actions"
   - После первого пуша, Actions автоматически соберет и задеплоит сайт

### Ручной деплой

```bash
cd "the-lab-web-site"
npm run build
npm install -g gh-pages
gh-pages -d build
```

Затем в настройках Pages выберите ветку `gh-pages`.

## 🎨 Настройка эффектов

Эффекты настраиваются в файле `src/components/animations/fluidConfig.ts`:

- `DISABLED`: Полностью отключить эффект
- `FIXED_HUE`: Цвет эффекта (0-1)
- `AUTO_SPLATS_ENABLED`: Автоматические вспышки
- `AUTO_SPLATS_INTERVAL`: Интервал между вспышками (мс)
- `AUTO_SPLAT_FORCE`: Сила движения автоматических вспышек

## 🛠 Разработка

```bash
npm install
npm run dev
```

## 📦 Сборка

```bash
npm run build
```

## ✨ Технологии

- **React 18** - Основной фреймворк
- **Vite** - Инструмент сборки
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Radix UI** - Компоненты интерфейса
- **Motion** - Анимации
- **React Hook Form** - Формы
- **Next Themes** - Темная тема

## ✨ Возможности

- Интерактивные fluid эффекты
- Адаптивный дизайн
- Темная тема
- Анимации при скролле
- Форма заявки
- Современный UI с Radix компонентами
- Typewriter эффекты
- Scroll reveal анимации