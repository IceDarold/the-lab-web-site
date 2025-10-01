# AI Community Landing Page

Современная лендинг-страница для AI сообщества с интерактивными fluid эффектами.

## 🚀 Деплой на GitHub Pages

### Автоматический деплой с GitHub Actions

1. **Создайте репозиторий на GitHub**
   - Перейдите на [github.com](https://github.com) и создайте новый репозиторий
   - Рекомендуемое имя: `ai-community-landing-page`

2. **Настройте локальный репозиторий**
   ```bash
   cd "AI Community Landing Page"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Замените плейсхолдеры**
   - В `vite.config.ts` замените `/ai-community-landing-page/` на `/YOUR_REPO_NAME/`
   - В `package.json` замените `https://username.github.io/ai-community-landing-page` на `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

4. **Включите GitHub Pages**
   - Перейдите в Settings вашего репозитория
   - В разделе Pages выберите Source: "GitHub Actions"
   - После первого пуша, Actions автоматически соберет и задеплоит сайт

### Ручной деплой

```bash
cd "AI Community Landing Page"
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

## ✨ Возможности

- Интерактивные fluid эффекты
- Адаптивный дизайн
- Темная тема
- Анимации при скролле
- Форма заявки
- Современный UI с Radix компонентами