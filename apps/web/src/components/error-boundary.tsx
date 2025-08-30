'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { announceToScreenReader } from '../lib/accessibility';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Announce error to screen readers
    announceToScreenReader('An error occurred. Please try refreshing the page.', 'assertive');
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.'
}: ErrorFallbackProps) {
  return (
    <div 
      className="min-h-[400px] flex items-center justify-center p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-red-600 dark:text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Details
            </summary>
            <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  title, 
  message, 
  type = 'error', 
  onDismiss, 
  className = '' 
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-800 dark:text-red-200',
      message: 'text-red-700 dark:text-red-300'
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-200',
      message: 'text-yellow-700 dark:text-yellow-300'
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
      message: 'text-blue-700 dark:text-blue-300'
    }
  };

  const styles = typeStyles[type];

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        );
      case 'warning':
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        );
      case 'info':
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        );
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 ${styles.container} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className={`h-5 w-5 ${styles.icon}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {getIcon()}
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.message}`}>
            {message}
          </p>
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${styles.icon} hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent`}
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}