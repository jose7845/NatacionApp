import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 ${hover ? 'hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800 transition-all cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
