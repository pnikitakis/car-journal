/**
 * Accessibility utilities and helpers
 */

/**
 * Generate unique IDs for form elements
 */
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private focusStack: HTMLElement[] = [];
  
  /**
   * Save current focus and set new focus
   */
  pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }
  
  /**
   * Restore previous focus
   */
  popFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }
  
  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardNavigation = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ): void {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }
  },
  
  /**
   * Handle Enter and Space key activation
   */
  handleActivation(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

/**
 * ARIA helpers
 */
export const AriaHelpers = {
  /**
   * Set expanded state for collapsible elements
   */
  setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  },
  
  /**
   * Set selected state for selectable elements
   */
  setSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString());
  },
  
  /**
   * Set pressed state for toggle buttons
   */
  setPressed(element: HTMLElement, pressed: boolean): void {
    element.setAttribute('aria-pressed', pressed.toString());
  },
  
  /**
   * Set loading state
   */
  setLoading(element: HTMLElement, loading: boolean): void {
    if (loading) {
      element.setAttribute('aria-busy', 'true');
      element.setAttribute('aria-live', 'polite');
    } else {
      element.removeAttribute('aria-busy');
      element.removeAttribute('aria-live');
    }
  }
};

/**
 * Color contrast utilities
 */
export const ColorContrast = {
  /**
   * Calculate relative luminance
   */
  getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  
  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
    const lum1 = this.getLuminance(...color1);
    const lum2 = this.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },
  
  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAG_AA(color1: [number, number, number], color2: [number, number, number]): boolean {
    return this.getContrastRatio(color1, color2) >= 4.5;
  }
};

/**
 * Screen reader utilities
 */
export const ScreenReader = {
  /**
   * Hide element from screen readers
   */
  hide(element: HTMLElement): void {
    element.setAttribute('aria-hidden', 'true');
  },
  
  /**
   * Show element to screen readers
   */
  show(element: HTMLElement): void {
    element.removeAttribute('aria-hidden');
  },
  
  /**
   * Create screen reader only text
   */
  createSROnlyText(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  }
};

/**
 * Reduced motion detection
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast detection
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}