import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { ShieldAlert, CheckCircle2, ListChecks, MessageSquare, ChevronRight, XCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Button, buttonVariants } from '@/app/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

interface PlaybookData {
    title: string;
    priorities: string[];
    protocols: string[];
    comm_strategy: string;
}

interface ActionPlaybookCardProps {
    district: string;
    className?: string;
}

export function ActionPlaybookCard({ district, className }: ActionPlaybookCardProps) {
    const [data, setData] = useState<PlaybookData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlaybook() {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/ai/playbook/${district}`);
                if (!response.ok) throw new Error('Failed to fetch playbook');
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (district) {
            fetchPlaybook();
        }
    }, [district]);

    if (loading) {
        return <Skeleton className={cn("h-[400px] w-full rounded-lg", className)} />;
    }

    if (!data) return null;

    return (
        <Card className={cn("border-border overflow-hidden bg-card/30 flex flex-col h-full", className)}>
            <CardHeader className="bg-primary/5 border-b border-border py-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
                    <ShieldAlert className="w-4 h-4" />
                    Action Playbook: {data.title}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Priorities Section */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground-secondary uppercase tracking-widest">
                            <ListChecks className="w-3.5 h-3.5 text-primary" />
                            Immediate Priorities
                        </div>
                        <div className="grid gap-2.5">
                            {data.priorities.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg group transition-colors hover:bg-primary/10">
                                    <div className="mt-1 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary italic">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm text-foreground leading-tight font-medium">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Protocols Section */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground-secondary uppercase tracking-widest">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Administrative Protocols
                        </div>
                        <div className="space-y-2">
                            {data.protocols.map((protocol, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-foreground font-medium pl-1">
                                    <ChevronRight className="w-3 h-3 text-primary/50" />
                                    {protocol}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Comm Strategy Section */}
                    <section className="p-4 bg-background-tertiary rounded-lg border border-border-subtle space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-foreground-tertiary uppercase tracking-[0.2em]">
                            <MessageSquare className="w-3 h-3" />
                            Communication Strategy
                        </div>
                        <p className="text-xs text-foreground-secondary italic leading-relaxed">
                            "{data.comm_strategy}"
                        </p>
                    </section>
                </div>

                <div className="px-5 pb-4 space-y-3">
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        Approve Suggested Actions?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will log your approval of the current playbook for {district}.
                                        Administrative protocols will be formally initiated.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => alert(`Action approved for ${district}`)}
                                    >
                                        Confirm Approval
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="flex-1 shadow-lg shadow-destructive/20"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-destructive" />
                                        Reject Suggested Actions?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to reject these suggested protocols for {district}?
                                        This action will be audited for compliance purposes.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className={cn(buttonVariants({ variant: "destructive" }))}
                                        onClick={() => alert(`Action rejected for ${district}`)}
                                    >
                                        Confirm Rejection
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="p-4 bg-primary/5 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-foreground-tertiary font-medium">
                        Advisory only • Generated from NE-NETRA Intelligence
                    </span>
                    <button className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1">
                        Download SOP PDF
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
