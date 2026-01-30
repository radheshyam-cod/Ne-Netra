import React from 'react';
import { Shield, Database, Scale, Cog } from 'lucide-react';

export function ComplianceFooter() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Compliance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-severity-low flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Decision Support Only</p>
              <p className="text-xs text-foreground-secondary mt-1">
                No automated enforcement. Final decisions always human-led.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-severity-low flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Public / Synthetic Data Only</p>
              <p className="text-xs text-foreground-secondary mt-1">
                District-level aggregation. No individual tracking or surveillance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-severity-low flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">DPDP Act 2023 Aligned</p>
              <p className="text-xs text-foreground-secondary mt-1">
                Compliant with Digital Personal Data Protection Act 2023.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="border-t border-border pt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 opacity-50">
            <span className="font-bold tracking-tight">NE-NETRA</span>
            <span className="mx-1">•</span>
            <span className="uppercase tracking-widest text-[10px]">Version 1.0 Pilot</span>
          </div>
          <p className="text-sm text-foreground-tertiary">
            Early Warning & Accountability Platform for North-East India
          </p>
          <p className="text-xs text-foreground-tertiary mt-2">
            Prototype for controlled 6-week pilot | District-level intelligence only | Full audit trail maintained
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <div className="inline-block px-3 py-1 bg-background-tertiary rounded text-xs text-foreground-tertiary border border-border-subtle">
              Model: 3-Layer Sigmoid (Cognitive, Network, Physical)
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-background-tertiary rounded text-xs text-foreground-tertiary border border-border-subtle">
              <Cog className="w-3 h-3" />
              Federated Learning: Active (Simulated) - Weights Syncing
            </div>
          </div>
          <p className="text-[10px] text-foreground-tertiary mt-2 opacity-60">
            Admin Diagnostics: Model weights updated based on 12 recent officer feedback loops.
          </p>
        </div>
      </div>
    </footer>
  );
}
