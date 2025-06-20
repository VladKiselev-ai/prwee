import nodemailer from 'nodemailer';
import TelegramBot from 'node-telegram-bot-api';
import dbConnect from './database';
import User from '@/models/User';
import Article from '@/models/Article';

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Telegram bot
const telegramBot = process.env.TELEGRAM_BOT_TOKEN 
  ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  : null;

export interface NotificationData {
  userId: string;
  type: 'digest' | 'monitored' | 'important';
  title: string;
  message: string;
  data?: any;
}

export async function sendNotification(notification: NotificationData): Promise<boolean> {
  try {
    await dbConnect();
    
    const user = await User.findById(notification.userId);
    if (!user || !user.isActive) {
      return false;
    }
    
    let success = true;
    
    // Отправляем email уведомление
    if (user.preferences.notificationSettings.email) {
      const emailSuccess = await sendEmailNotification(user, notification);
      success = success && emailSuccess;
    }
    
    // Отправляем Telegram уведомление
    if (user.preferences.notificationSettings.telegram && 
        user.preferences.notificationSettings.telegramChatId &&
        telegramBot) {
      const telegramSuccess = await sendTelegramNotification(user, notification);
      success = success && telegramSuccess;
    }
    
    return success;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

async function sendEmailNotification(user: any, notification: NotificationData): Promise<boolean> {
  try {
    const emailContent = generateEmailContent(notification);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: notification.title,
      html: emailContent,
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

async function sendTelegramNotification(user: any, notification: NotificationData): Promise<boolean> {
  try {
    if (!telegramBot || !user.preferences.notificationSettings.telegramChatId) {
      return false;
    }
    
    const message = generateTelegramMessage(notification);
    
    await telegramBot.sendMessage(
      user.preferences.notificationSettings.telegramChatId,
      message,
      { parse_mode: 'HTML' }
    );
    
    console.log(`Telegram notification sent to ${user.name}`);
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

function generateEmailContent(notification: NotificationData): string {
  const { type, title, message, data } = notification;
  
  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8fafc; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        .article { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
        .article-title { font-weight: bold; color: #1e40af; }
        .article-summary { color: #64748b; margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${message}</p>
  `;
  
  if (data && data.articles && data.articles.length > 0) {
    content += '<h3>Статьи:</h3>';
    data.articles.forEach((article: any) => {
      content += `
        <div class="article">
          <div class="article-title">${article.title}</div>
          <div class="article-summary">${article.summary || article.content.substring(0, 150)}...</div>
          <a href="${article.url}" style="color: #3b82f6;">Читать далее</a>
        </div>
      `;
    });
  }
  
  content += `
        </div>
        <div class="footer">
          <p>Это автоматическое уведомление от новостного агрегатора</p>
          <p>Вы можете отписаться от уведомлений в настройках профиля</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return content;
}

function generateTelegramMessage(notification: NotificationData): string {
  const { type, title, message, data } = notification;
  
  let content = `<b>${title}</b>\n\n${message}\n\n`;
  
  if (data && data.articles && data.articles.length > 0) {
    content += '<b>Статьи:</b>\n\n';
    data.articles.forEach((article: any, index: number) => {
      content += `${index + 1}. <a href="${article.url}">${article.title}</a>\n`;
      if (article.summary) {
        content += `${article.summary.substring(0, 100)}...\n\n`;
      }
    });
  }
  
  return content;
}

export async function sendDailyDigest(): Promise<void> {
  try {
    await dbConnect();
    
    const users = await User.find({
      isActive: true,
      'preferences.notificationSettings.digestFrequency': 'daily',
    });
    
    for (const user of users) {
      try {
        // Получаем предпочитаемые категории пользователя
        const categories = user.preferences.categories;
        
        if (categories.length === 0) continue;
        
        // Получаем статьи за последние 24 часа
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const articles = await Article.find({
          category: { $in: categories },
          publishedAt: { $gte: yesterday },
        })
          .sort({ importance: -1, publishedAt: -1 })
          .limit(10)
          .populate('category', 'name');
        
        if (articles.length === 0) continue;
        
        const notification: NotificationData = {
          userId: user._id.toString(),
          type: 'digest',
          title: 'Ежедневный дайджест новостей',
          message: `За последние 24 часа в ваших категориях было опубликовано ${articles.length} статей.`,
          data: { articles },
        };
        
        await sendNotification(notification);
        
        // Небольшая задержка между отправками
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error sending digest to user ${user._id}:`, error);
      }
    }
    
    console.log('Daily digest notifications sent');
  } catch (error) {
    console.error('Error sending daily digest:', error);
  }
}

export async function sendMonitoredArticleUpdates(): Promise<void> {
  try {
    await dbConnect();
    
    const users = await User.find({
      isActive: true,
      'monitoredArticles.0': { $exists: true },
    }).populate('monitoredArticles.article');
    
    for (const user of users) {
      try {
        const monitoredArticles = user.monitoredArticles;
        const updatedArticles = [];
        
        for (const monitored of monitoredArticles) {
          const article = monitored.article;
          if (article && article.updatedAt > monitored.addedAt) {
            updatedArticles.push(article);
          }
        }
        
        if (updatedArticles.length > 0) {
          const notification: NotificationData = {
            userId: user._id.toString(),
            type: 'monitored',
            title: 'Обновления отслеживаемых статей',
            message: `У ${updatedArticles.length} отслеживаемых статей появились обновления.`,
            data: { articles: updatedArticles },
          };
          
          await sendNotification(notification);
        }
      } catch (error) {
        console.error(`Error checking monitored articles for user ${user._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending monitored article updates:', error);
  }
} 