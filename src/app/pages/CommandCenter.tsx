/**
 * Command Center Page
 * 
 * Full-screen crisis management interface with real-time updates
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket, useRiskAlerts, useDistrictUpdates } from '../hooks/use-websocket';
import { RiskMap } from '../components/risk-map';
import { useSpeechRecognition } from '../hooks/use-speech-recognition';

interface CommandCenterProps {
    defaultDistrict?: string;
}

export function CommandCenter({ defaultDistrict }: CommandCenterProps) {
    const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict || '');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showVoiceControl, setShowVoiceControl] = useState(false);

    const { isConnected } = useWebSocket();
    const { alerts } = useRiskAlerts();
    const { updates } = useDistrictUpdates(selectedDistrict);

    const {
        isListening,
        transcript,
        startListening,
        stopListening
    } = useSpeechRecognition({
        onCommand: handleVoiceCommand
    });

    function handleVoiceCommand(command: string) {
        const lower = command.toLowerCase();

        // "Show <district>"
        if (lower.startsWith('show ')) {
            const district = command.substring(5).trim();
            setSelectedDistrict(district);
        }

        // "Alert level"
        if (lower.includes('alert')) {
            // Scroll to alerts
            document.getElementById('alerts-panel')?.scrollIntoView({ behavior: 'smooth' });
        }

        // "Fullscreen"
        if (lower.includes('fullscreen')) {
            toggleFullscreen();
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-white overflow-hidden">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Command Center</h1>

                        {/* Connection Status */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-400">
                                {isConnected ? 'Live' : 'Disconnected'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Voice Control Toggle */}
                        <button
                            onClick={() => {
                                if (isListening) {
                                    stopListening();
                                } else {
                                    startListening();
                                }
                            }}
                            className={`px-4 py-2 rounded-md ${isListening
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                        >
                            {isListening ? '🎤 Listening...' : '🎤 Voice Control'}
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                        >
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </button>
                    </div>
                </div>

                {/* Voice Transcript */}
                {isListening && transcript && (
                    <div className="mt-2 px-4 py-2 bg-blue-900/30 border border-blue-700 rounded-md text-sm">
                        <span className="text-blue-400">Heard:</span> {transcript}
                    </div>
                )}
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-80px)]">
                {/* Left Panel - Map */}
                <div className="col-span-8 bg-gray-800 rounded-lg overflow-hidden">
                    <RiskMap
                        selectedDistrict={selectedDistrict}
                        onDistrictSelect={setSelectedDistrict}
                    />
                </div>

                {/* Right Panel - Alerts & Updates */}
                <div className="col-span-4 space-y-4 overflow-y-auto">
                    {/* Critical Alerts */}
                    <div id="alerts-panel" className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-3">🚨 Critical Alerts</h2>
                        <div className="space-y-2">
                            {alerts.slice(0, 5).map((alert, idx) => (
                                <div
                                    key={idx}
                                    className="bg-red-900/30 border border-red-700 rounded p-3 text-sm"
                                >
                                    <div className="font-semibold">{alert.district}</div>
                                    <div className="text-gray-300">{alert.message}</div>
                                    <div className="text-gray-500 text-xs mt-1">
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                            {alerts.length === 0 && (
                                <p className="text-gray-500 text-sm">No critical alerts</p>
                            )}
                        </div>
                    </div>

                    {/* Live Updates */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-3">📡 Live Updates</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {updates.slice(0, 10).map((update, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-700 rounded p-3 text-sm animate-fade-in"
                                >
                                    <div className="text-gray-300">{update.message}</div>
                                    <div className="text-gray-500 text-xs mt-1">
                                        {new Date(update.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                            {updates.length === 0 && (
                                <p className="text-gray-500 text-sm">No recent updates</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-3">⚡ Quick Actions</h2>
                        <div className="space-y-2">
                            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-left">
                                Deploy Response Team
                            </button>
                            <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-left">
                                Escalate to Supervisor
                            </button>
                            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-left">
                                Mark as Resolved
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
