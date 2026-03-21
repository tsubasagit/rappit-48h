import type { ReactNode, MouseEventHandler } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

export function Card({ children, header, footer, onClick, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as unknown as React.MouseEvent<HTMLDivElement>); } : undefined}
    >
      {header && (
        <div className="border-b border-gray-100 px-6 py-4">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="border-t border-gray-100 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
