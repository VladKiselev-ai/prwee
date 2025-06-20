# 🇷🇺 Новостной агрегатор с AI-аналитикой

Современный новостной агрегатор на русском языке с искусственным интеллектом для анализа и мониторинга новостей.

## ✨ Возможности

- 📰 **22 русских источника** новостей
- 🏛️ **7 категорий**: Политика, Экономика, Технологии, Спорт, Наука, Криптовалюты, Общие новости
- 🤖 **AI-анализ** статей с помощью DeepSeek API
- 📱 **Telegram уведомления** о важных новостях
- 📧 **Email рассылки** по категориям
- 🔍 **Мониторинг** ключевых слов
- 📊 **Аналитика** и статистика

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Клонируйте репозиторий
git clone https://github.com/ваш-username/prwee.git
cd prwee

# Установите зависимости
npm install

# Создайте .env.local файл
cp env.example .env.local

# Запустите сервер разработки
npm run dev
```

### Переменные окружения

Создайте файл `.env.local`:

```env
# OpenAI/DeepSeek API
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.deepseek.com/v1

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=594250971

# Email (опционально)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📰 Источники новостей

### 🏛️ Политика
- РИА Новости ✅
- ТАСС
- Интерфакс

### 💰 Экономика
- Коммерсантъ
- РБК
- Ведомости

### 💻 Технологии
- 3DNews
- IXBT
- Хабрахабр
- CNews

### ⚽ Спорт
- Спорт-Экспресс
- Советский спорт
- Чемпионат

### 🔬 Наука
- N+1
- Элементы
- Indicator

### ₿ Криптовалюты
- ForkLog
- Bits.media
- CoinSpot

### 📰 Общие новости
- Лента.ру
- Газета.ру
- Известия

## 🛠️ Технологии

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: DeepSeek API (OpenAI совместимый)
- **Notifications**: Telegram Bot API
- **RSS**: rss-parser
- **Deployment**: Vercel

## 📱 Скриншоты

### Главная страница
![Главная страница](screenshots/main.png)

### AI-анализ
![AI-анализ](screenshots/ai-analysis.png)

### Мониторинг
![Мониторинг](screenshots/monitoring.png)

## 🔗 API Endpoints

- `GET /api/articles` - Получить статьи
- `GET /api/categories` - Получить категории
- `POST /api/articles/analyze` - AI-анализ статьи
- `POST /api/notifications/telegram` - Отправить уведомление в Telegram

## 🚀 Деплой

### Vercel (Рекомендуется)

1. Создайте аккаунт на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Настройте переменные окружения
4. Деплой произойдет автоматически

### Другие платформы

- **Netlify**: Подключите репозиторий и настройте build command
- **Railway**: Автоматический деплой из GitHub
- **Render**: Создайте Web Service

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 👨‍💻 Автор

Владислав Киселёв

---

**🇷🇺 Новостной агрегатор с AI-аналитикой на русском языке!** 