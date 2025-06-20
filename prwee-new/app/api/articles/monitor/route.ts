import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Article from '@/models/Article';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { articleId, userId, notes } = body;
    
    if (!articleId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Article ID and User ID are required' },
        { status: 400 }
      );
    }
    
    // Проверяем существование статьи
    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Проверяем существование пользователя
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Проверяем, не отслеживается ли уже статья пользователем
    const alreadyMonitored = user.monitoredArticles.some(
      (item: any) => item.article.toString() === articleId
    );
    
    if (alreadyMonitored) {
      return NextResponse.json(
        { success: false, error: 'Article is already being monitored' },
        { status: 409 }
      );
    }
    
    // Добавляем статью в мониторинг пользователя
    user.monitoredArticles.push({
      article: articleId,
      notes: notes || '',
    });
    
    await user.save();
    
    // Обновляем флаг мониторинга в статье
    if (!article.monitoredBy.includes(userId)) {
      article.monitoredBy.push(userId);
      article.isMonitored = true;
      await article.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Article added to monitoring successfully',
    });
  } catch (error) {
    console.error('Error adding article to monitoring:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add article to monitoring' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const userId = searchParams.get('userId');
    
    if (!articleId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Article ID and User ID are required' },
        { status: 400 }
      );
    }
    
    // Удаляем статью из мониторинга пользователя
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    user.monitoredArticles = user.monitoredArticles.filter(
      (item: any) => item.article.toString() !== articleId
    );
    
    await user.save();
    
    // Обновляем флаг мониторинга в статье
    const article = await Article.findById(articleId);
    if (article) {
      article.monitoredBy = article.monitoredBy.filter(
        (id: any) => id.toString() !== userId
      );
      
      if (article.monitoredBy.length === 0) {
        article.isMonitored = false;
      }
      
      await article.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Article removed from monitoring successfully',
    });
  } catch (error) {
    console.error('Error removing article from monitoring:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove article from monitoring' },
      { status: 500 }
    );
  }
} 