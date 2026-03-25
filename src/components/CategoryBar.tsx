import React from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface CategoryBarProps {
  categories: { label: Category; icon: any }[];
  selectedCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border-b border-zinc-100 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-4">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex flex-col items-center gap-2 min-w-fit transition-all group",
            !selectedCategory ? "text-purple-600" : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            !selectedCategory ? "bg-purple-50 shadow-inner" : "bg-zinc-50 group-hover:bg-zinc-100"
          )}>
            <span className="font-bold text-xs">Tudo</span>
          </div>
          <span className="text-xs font-medium">Todas</span>
        </button>

        {categories.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onSelectCategory(label)}
            className={cn(
              "flex flex-col items-center gap-2 min-w-fit transition-all group",
              selectedCategory === label ? "text-purple-600" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              selectedCategory === label ? "bg-purple-50 shadow-inner" : "bg-zinc-50 group-hover:bg-zinc-100"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
