/**
 * Copy to Clipboard Button Component
 * 
 * Reusable button with copy functionality and toast feedback
 */

import React, { useState } from 'react';
import { toast } from './ui/toast';

interface CopyButtonProps {
    text: string;
    label?: string;
    successMessage?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function CopyButton({
    text,
    label = 'Copy',
    successMessage = 'Copied to clipboard!',
    variant = 'ghost',
    size = 'sm',
    className = ''
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(successMessage);

            // Reset after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
        }
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-base',
        lg: 'px-4 py-2 text-lg'
    };

    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        ghost: 'hover:bg-gray-100 text-gray-600'
    };

    return (
        <button
            onClick={handleCopy}
            className={`
        inline-flex items-center gap-2 rounded-md font-medium
        transition-colors duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
            title="Copy to clipboard"
        >
            {copied ? (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}

// Specialized variant for risk scores
interface CopyRiskScoreButtonProps {
    district: string;
    score: number;
    riskLevel: string;
}

export function CopyRiskScoreButton({ district, score, riskLevel }: CopyRiskScoreButtonProps) {
    const text = `${district}: ${score}/100 (${riskLevel.toUpperCase()})`;

    return (
        <CopyButton
            text={text}
            label="Copy Score"
            successMessage={`Copied: ${text}`}
            variant="ghost"
            size="sm"
        />
    );
}
