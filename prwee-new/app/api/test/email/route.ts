import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, content } = body;

    if (!to || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'To, subject and content are required' },
        { status: 400 }
      );
    }

    console.log('Тестируем Email уведомления...');
    
    // Проверяем наличие email настроек
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email settings not found',
          message: 'Добавьте SMTP настройки в .env.local'
        },
        { status: 400 }
      );
    }

    // Создаем transporter
    const emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Отправляем тестовое письмо
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: `
        <h2>Тестовое письмо от новостного агрегатора</h2>
        <p>Это тестовое письмо для проверки настроек email уведомлений.</p>
        <p><strong>Содержание:</strong> ${content}</p>
        <p><em>Отправлено: ${new Date().toLocaleString('ru-RU')}</em></p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    
    return NextResponse.json({
      success: true,
      data: {
        to,
        subject,
        sentAt: new Date().toISOString()
      },
      message: 'Email отправлен успешно!'
    });
  } catch (error) {
    console.error('Error testing email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Проверьте правильность SMTP настроек и App Password'
      },
      { status: 500 }
    );
  }
} 