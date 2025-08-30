'use client';

import { useState } from 'react';
import { ThemeProvider } from './theme-provider';
import { ThemeToggle, ThemeToggleButton } from './theme-toggle';
import { LoadingSpinner, LoadingSkeleton, ProgressBar, LoadingOverlay, LoadingButton, LoadingCard, LoadingList } from './loading-states';
import { ErrorBoundary, ErrorMessage } from './error-boundary';
import { announceToScreenReader } from '../lib/accessibility';

export function AccessibilityDemo() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleProgressUpdate = () => {
    const newProgress = Math.min(progress + 20, 100);
    setProgress(newProgress);
    announceToScreenReader(`Progress updated to ${newProgress}%`);
  };

  const handleLoadingTest = async () => {
    setIsLoading(true);
    announceToScreenReader('Loading started');
    
    setTimeout(() => {
      setIsLoading(false);
      announceToScreenReader('Loading completed');
    }, 2000);
  };

  const handleOverlayTest = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  const handleAnnouncement = () => {
    announceToScreenReader('This is a test announcement for screen readers', 'assertive');
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Accessibility & UX Features Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This page demonstrates all the accessibility and user experience features implemented in the Car Journal application.
            </p>
          </header>

          {/* Theme Controls */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Theme Controls
            </h2>
            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme Selector:
                </label>
                <ThemeToggle />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme Toggle Button:
                </label>
                <ThemeToggleButton />
              </div>
            </div>
          </section>

          {/* Loading States */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Loading States
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Spinners</h3>
                <div className="flex items-center gap-4">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Skeleton</h3>
                <LoadingSkeleton lines={3} avatar />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Progress Bar</h3>
                <ProgressBar 
                  value={progress} 
                  label="Upload Progress" 
                  className="mb-3"
                />
                <button
                  onClick={handleProgressUpdate}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Progress
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Loading Button</h3>
                <LoadingButton
                  isLoading={isLoading}
                  loadingText="Processing..."
                  onClick={handleLoadingTest}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Start Loading Test
                </LoadingButton>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Loading Overlay</h3>
                <LoadingOverlay isLoading={showOverlay} message="Processing your request...">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <p className="text-gray-700 dark:text-gray-300">This content will be overlaid</p>
                    <button
                      onClick={handleOverlayTest}
                      className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Show Overlay
                    </button>
                  </div>
                </LoadingOverlay>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Loading Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LoadingCard hasImage hasActions />
                <div>
                  <LoadingList items={3} />
                </div>
              </div>
            </div>
          </section>

          {/* Error Handling */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Error Handling
            </h2>
            
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setShowError(!showError)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                >
                  {showError ? 'Hide' : 'Show'} Error Message
                </button>
                
                {showError && (
                  <ErrorMessage
                    title="Validation Error"
                    message="Please check your input and try again. Some fields are required."
                    type="error"
                    onDismiss={() => setShowError(false)}
                  />
                )}
              </div>

              <ErrorMessage
                title="Warning"
                message="This action cannot be undone. Please proceed with caution."
                type="warning"
              />

              <ErrorMessage
                title="Information"
                message="Your data has been saved successfully."
                type="info"
              />
            </div>
          </section>

          {/* Keyboard Navigation */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Keyboard Navigation
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Try navigating this page using only your keyboard:
              </p>
              
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Tab</kbd> - Navigate forward</li>
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Shift + Tab</kbd> - Navigate backward</li>
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> or <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Space</kbd> - Activate buttons</li>
                <li><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Arrow Keys</kbd> - Navigate within components</li>
              </ul>

              <div className="flex gap-2 mt-4">
                <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Button 1
                </button>
                <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                  Button 2
                </button>
                <button className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  Button 3
                </button>
              </div>
            </div>
          </section>

          {/* Screen Reader Features */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Screen Reader Features
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                This page includes proper ARIA labels, semantic markup, and live regions for screen readers.
              </p>
              
              <button
                onClick={handleAnnouncement}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Test Screen Reader Announcement
              </button>
              
              <div className="mt-4">
                <label htmlFor="demo-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Properly Labeled Input:
                </label>
                <input
                  id="demo-input"
                  type="text"
                  placeholder="This input has proper labeling"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-describedby="demo-input-help"
                />
                <p id="demo-input-help" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This help text is properly associated with the input field.
                </p>
              </div>
            </div>
          </section>

          {/* Form Validation */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Accessible Form Validation
            </h2>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="email-demo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  id="email-demo"
                  type="email"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500 invalid:ring-red-500"
                  aria-describedby="email-error"
                />
                <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  Please enter a valid email address.
                </p>
              </div>

              <div>
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Preferences
                  </legend>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">SMS notifications</span>
                    </label>
                  </div>
                </fieldset>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Form
              </button>
            </form>
          </section>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}