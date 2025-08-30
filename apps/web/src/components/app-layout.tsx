'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './theme-provider';
import { ThemeToggleButton } from './theme-toggle';
import { ErrorBoundary } from './error-boundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Timeline', href: '/timeline', icon: '📅' },
    { name: 'Add Event', href: '/add-event', icon: '➕' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'Vehicle', href: '/vehicle', icon: '🚗' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Export', href: '/data-management', icon: '📤' },
  ];

  const isActive = (href: string) => {
    if (href === '/timeline') {
      return pathname === '/' || pathname === '/timeline';
    }
    return pathname.startsWith(href);
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Mobile menu overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:inset-0`}>
            <div className="flex flex-col h-full">
              {/* Logo/Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                <Link 
                  href="/"
                  className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="text-2xl" role="img" aria-label="Car">🚗</span>
                  <span>Car Journal</span>
                </Link>
                
                {/* Mobile close button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2" role="navigation" aria-label="Main navigation">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <span className="text-lg" role="img" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Car Journal v1.0
                  </span>
                  <ThemeToggleButton />
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:pl-64">
            {/* Top bar */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              <div className="flex items-center justify-between h-16 px-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <Link 
                  href="/"
                  className="flex items-center space-x-2 text-lg font-bold text-gray-900 dark:text-gray-100"
                >
                  <span className="text-xl" role="img" aria-label="Car">🚗</span>
                  <span>Car Journal</span>
                </Link>
                
                <ThemeToggleButton />
              </div>
            </header>

            {/* Page content */}
            <main className="min-h-screen">
              {children}
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}