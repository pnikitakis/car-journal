'use client';

import { AriaHelpers } from '../lib/accessibility';
import { useEffect, useRef } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = 'md', className = '', label = 'Loading' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-pulse ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function LoadingSkeleton({ className = '', lines = 3, avatar = false }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="Loading content">
      <div className="flex space-x-4">
        {avatar && (
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
                i === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            ></div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading content</span>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className = '', 
  label = 'Progress',
  showPercentage = true 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      AriaHelpers.setLoading(progressRef.current, percentage < 100);
    }
  }, [percentage]);

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        ref={progressRef}
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  className = '' 
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div
          className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
          role="status"
          aria-label={message}
        >
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({ 
  isLoading, 
  loadingText, 
  children, 
  disabled,
  className = '',
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center ${className}`}
      aria-busy={isLoading}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}

interface LoadingCardProps {
  className?: string;
  hasImage?: boolean;
  hasActions?: boolean;
}

export function LoadingCard({ className = '', hasImage = false, hasActions = false }: LoadingCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="animate-pulse">
        {hasImage && (
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
        )}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        {hasActions && (
          <div className="flex space-x-2 mt-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        )}
      </div>
      <span className="sr-only">Loading card content</span>
    </div>
  );
}

interface LoadingListProps {
  items?: number;
  className?: string;
}

export function LoadingList({ items = 5, className = '' }: LoadingListProps) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading list">
      {Array.from({ length: items }).map((_, i) => (
        <LoadingSkeleton key={i} lines={2} avatar />
      ))}
      <span className="sr-only">Loading list items</span>
    </div>
  );
}