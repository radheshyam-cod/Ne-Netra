import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { showToast } from './ui/toast';

interface ShareLinkGeneratorProps {
    district?: string;
    filters?: Record<string, any>;
}

/**
 * Generate and share links to specific district/filter combinations
 */
export function ShareLinkGenerator({ district, filters }: ShareLinkGeneratorProps) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const generateShareLink = () => {
        const params = new URLSearchParams();

        if (district) {
            params.set('district', district);
        }

        if (filters) {
            // Encode filters as JSON in URL
            params.set('filters', JSON.stringify(filters));
        }

        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?${params.toString()}`;
    };

    const shareLink = generateShareLink();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            showToast.success('Link copied to clipboard');

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showToast.error('Failed to copy link');
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `NE-NETRA: ${district || 'Dashboard'}`,
                    text: `View risk analysis for ${district || 'this region'}`,
                    url: shareLink,
                });
            } catch (error) {
                // User cancelled or error
                console.error('Share failed:', error);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Analysis</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Share Link</label>
                        <div className="flex gap-2">
                            <Input
                                value={shareLink}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Anyone with this link can view this district analysis
                        </p>
                    </div>

                    {!!navigator.share && (
                        <Button onClick={handleNativeShare} className="w-full">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share via...
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
