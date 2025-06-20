'use client';

import Link from 'next/link';
import { ArrowRight, Rss } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function CategoryCard({ category, onClick, isSelected }: CategoryCardProps) {
  const rssCount = category.rssSources.filter(source => source.isActive).length;

  const cardContent = (
    <div className={`card card-hover h-full ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: category.color + '20', color: category.color }}
        >
          {category.icon}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Rss className="w-4 h-4" />
          <span>{rssCount}</span>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {category.name}
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {category.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center space-x-2">
          {category.parentCategory && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {category.parentCategory.name}
            </span>
          )}
        </div>
        
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {cardContent}
      </button>
    );
  }

  return (
    <Link href={`/category/${category.slug}`}>
      {cardContent}
    </Link>
  );
} 