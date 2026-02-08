/**
 * Accessibility Utilities and ARIA Helpers
 */

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Screen Reader Only CSS Class
 * Add this to your global CSS:
 */
export const srOnlyClass = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
`;

/**
 * Get ARIA label for risk level
 */
export function getRiskLevelAriaLabel(score: number, level: string): string {
    return `Risk score ${score} out of 100, classified as ${level} risk`;
}

/**
 * Get ARIA description for trend
 */
export function getTrendAriaDescription(trend: string): string {
    const trendMap: Record<string, string> = {
        'rising': 'trending upward, situation worsening',
        'falling': 'trending downward, situation improving',
        'stable': 'remaining stable, no significant change',
        'volatile': 'fluctuating, unstable situation',
    };

    return trendMap[trend.toLowerCase()] || trend;
}

/**
 * Get ARIA label for layer score
 */
export function getLayerAriaLabel(layer: string, score: number): string {
    const status = score >= 7 ? 'high alert' : score >= 5 ? 'moderate' : 'low';
    return `${layer} layer score ${score.toFixed(1)} out of 10, ${status}`;
}

/**
 * Focus trap for modals/dialogs
 */
export function setupFocusTrap(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const trapFocus = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        }
    };

    container.addEventListener('keydown', trapFocus);

    // Return cleanup function
    return () => {
        container.removeEventListener('keydown', trapFocus);
    };
}

/**
 * Skip to main content link
 * Add this component at the top of your app
 */
export function SkipToMainContent() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-4 focus:rounded focus:border-2 focus:border-blue-500"
        >
            Skip to main content
        </a>
    );
}
