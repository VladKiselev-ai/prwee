import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DeepSeek API key not found',
          message: 'Добавьте OPENAI_API_KEY в .env.local'
        },
        { status: 400 }
      );
    }

    // Инициализируем DeepSeek клиент
    const deepseek = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.deepseek.com', // DeepSeek API endpoint
    });

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat", // DeepSeek модель
      messages: [
        {
          role: "system",
          content: "Ты полезный ассистент. Отвечай кратко и по делу."
        },
        {
          role: "user",
          content: text || "Привет! Как дела?"
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      data: {
        response: completion.choices[0].message.content,
        model: "deepseek-chat",
        tokens: completion.usage?.total_tokens || 0,
        provider: "DeepSeek"
      },
      message: 'DeepSeek API работает успешно!'
    });

  } catch (error) {
    console.error('Error testing DeepSeek API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Ошибка при тестировании DeepSeek API'
      },
      { status: 500 }
    );
  }
} 