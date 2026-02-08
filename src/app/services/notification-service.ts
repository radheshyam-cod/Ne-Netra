import { useEffect, useState } from 'react';
import { showToast } from '../components/ui/toast';

export type ThresholdLevel = 60 | 75 | 90;

interface ThresholdAlert {
    district: string;
    oldScore: number;
    newScore: number;
    threshold: ThresholdLevel;
    timestamp: Date;
}

/**
 * Browser Notification Service
 */
class NotificationService {
    private permissionGranted = false;
    private alertHistory: ThresholdAlert[] = [];

    async initialize() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.permissionGranted = true;
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                this.permissionGranted = permission === 'granted';
            }
        }
    }

    canNotify(): boolean {
        return this.permissionGranted && 'Notification' in window;
    }

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            showToast.error('Browser notifications are not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permissionGranted = permission === 'granted';

            if (this.permissionGranted) {
                showToast.success('Notifications enabled successfully');
            } else {
                showToast.error('Notification permission denied');
            }

            return this.permissionGranted;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    sendThresholdAlert(alert: ThresholdAlert) {
        if (!this.canNotify()) return;

        const { district, newScore, threshold } = alert;

        const icon = threshold === 90 ? '🔴' : threshold === 75 ? '🟠' : '🟡';
        const urgency = threshold === 90 ? 'CRITICAL' : threshold === 75 ? 'HIGH' : 'ELEVATED';

        const notification = new Notification(`${icon} ${urgency} Risk Alert`, {
            body: `${district} has crossed ${threshold} threshold (Score: ${newScore})`,
            icon: '/ne-netra-icon.png', // Add your app icon
            badge: '/ne-netra-badge.png',
            tag: `threshold-${district}-${threshold}`,
            requireInteraction: threshold === 90, // Require user action for critical
        } as any);

        notification.onclick = () => {
            window.focus();
            window.location.href = `/?district=${encodeURIComponent(district)}`;
            notification.close();
        };

        // Store in history
        this.alertHistory.push(alert);
        this.saveHistory();

        // Also show toast
        showToast.error(`${district} crossed ${threshold} threshold!`);
    }

    getAlertHistory(): ThresholdAlert[] {
        return [...this.alertHistory];
    }

    private saveHistory() {
        try {
            localStorage.setItem('ne-netra-alert-history', JSON.stringify(this.alertHistory));
        } catch (error) {
            console.error('Failed to save alert history:', error);
        }
    }

    private loadHistory() {
        try {
            const stored = localStorage.getItem('ne-netra-alert-history');
            if (stored) {
                this.alertHistory = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load alert history:', error);
        }
    }
}

// Singleton instance
export const notificationService = new NotificationService();

/**
 * React Hook for Threshold Monitoring
 */
export function useThresholdMonitor(
    district: string,
    currentScore: number,
    enabled: boolean = true
) {
    const [previousScore, setPreviousScore] = useState<number | null>(null);

    useEffect(() => {
        if (!enabled || previousScore === null) {
            setPreviousScore(currentScore);
            return;
        }

        // Check threshold crossings
        const thresholds: ThresholdLevel[] = [60, 75, 90];

        for (const threshold of thresholds) {
            // Crossing upward
            if (previousScore < threshold && currentScore >= threshold) {
                notificationService.sendThresholdAlert({
                    district,
                    oldScore: previousScore,
                    newScore: currentScore,
                    threshold,
                    timestamp: new Date(),
                });
            }
        }

        setPreviousScore(currentScore);
    }, [district, currentScore, previousScore, enabled]);

    return {
        requestPermission: () => notificationService.requestPermission(),
        canNotify: () => notificationService.canNotify(),
        getHistory: () => notificationService.getAlertHistory(),
    };
}

// Initialize on import
notificationService.initialize();
