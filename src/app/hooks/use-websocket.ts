/**
 * WebSocket Hook
 * 
 * Real-time communication for live updates
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
    url?: string;
    autoConnect?: boolean;
    reconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
    const {
        url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000',
        autoConnect = true,
        reconnect = true
    } = options;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const listenersRef = useRef<Map<string, Function[]>>(new Map());

    useEffect(() => {
        if (!autoConnect) return;

        // Create socket connection
        const socketInstance = io(url, {
            transports: ['websocket', 'polling'],
            reconnection: reconnect,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Connection handlers
        socketInstance.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        setSocket(socketInstance);

        // Cleanup
        return () => {
            socketInstance.disconnect();
        };
    }, [url, autoConnect, reconnect]);

    // Subscribe to events
    const subscribe = useCallback((event: string, callback: Function) => {
        if (!socket) return () => { };

        socket.on(event, callback as any);

        // Track for cleanup
        const listeners = listenersRef.current.get(event) || [];
        listeners.push(callback);
        listenersRef.current.set(event, listeners);

        // Return unsubscribe function
        return () => {
            socket.off(event, callback as any);
            const currentListeners = listenersRef.current.get(event) || [];
            listenersRef.current.set(
                event,
                currentListeners.filter(l => l !== callback)
            );
        };
    }, [socket]);

    // Emit events
    const emit = useCallback((event: string, data: any) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        }
    }, [socket, isConnected]);

    // Send message
    const send = useCallback((message: any) => {
        emit('message', message);
    }, [emit]);

    return {
        socket,
        isConnected,
        subscribe,
        emit,
        send,
        lastMessage
    };
}

// Hook for specific channels
export function useDistrictUpdates(district: string) {
    const { subscribe, isConnected } = useWebSocket();
    const [updates, setUpdates] = useState<any[]>([]);

    useEffect(() => {
        if (!isConnected) return;

        const unsubscribe = subscribe(`district:${district}`, (data: any) => {
            setUpdates(prev => [...prev, data]);
        });

        return unsubscribe;
    }, [district, isConnected, subscribe]);

    return { updates, isConnected };
}

// Hook for risk alerts
export function useRiskAlerts() {
    const { subscribe, isConnected } = useWebSocket();
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        if (!isConnected) return;

        const unsubscribe = subscribe('risk:alert', (data: any) => {
            setAlerts(prev => [data, ...prev].slice(0, 50)); // Keep last 50
        });

        return unsubscribe;
    }, [isConnected, subscribe]);

    const clearAlerts = () => setAlerts([]);

    return { alerts, clearAlerts, isConnected };
}
