import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/card';
import { Button } from '@/app/components/button';
import { CheckCircle, Clock } from 'lucide-react';

interface AuditLogEntry {
  timestamp: string;
  officer: string;
  action: string;
}

interface OfficerReviewPanelProps {
  auditLog: AuditLogEntry[];
  district: string;
  riskScoreId: number;
  onSubmit?: (reviewData: any) => Promise<boolean>;
}

export function OfficerReviewPanel({ auditLog, district, riskScoreId, onSubmit }: OfficerReviewPanelProps) {
  const [isReviewed, setIsReviewed] = useState(false);
  const [notes, setNotes] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerRank, setOfficerRank] = useState('SP');
  const [submitting, setSubmitting] = useState(false);

  const handleReviewToggle = () => {
    setIsReviewed(!isReviewed);
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;

    setSubmitting(true);

    const reviewData = {
      district,
      risk_score_id: riskScoreId,
      officer_name: officerName || 'Officer',
      officer_rank: officerRank,
      reviewed: isReviewed,
      notes: notes,
      action_taken: notes,
    };

    const success = await onSubmit(reviewData);

    if (success) {
      // Reset form
      setNotes('');
      setIsReviewed(false);
    }

    setSubmitting(false);
  };

  const handleClear = () => {
    setNotes('');
    setIsReviewed(false);
    setOfficerName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Officer Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Officer Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="officer-rank" className="block text-sm font-medium text-foreground">
              Rank
            </label>
            <select
              id="officer-rank"
              value={officerRank}
              onChange={(e) => setOfficerRank(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-input-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-input-focus focus:border-input-focus"
            >
              <option value="SP">SP</option>
              <option value="DSP">DSP</option>
              <option value="DM">DM</option>
              <option value="ADM">ADM</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="officer-name" className="block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              type="text"
              id="officer-name"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="Officer Name"
              className="w-full px-4 py-2 bg-input-background border border-input-border rounded text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-input-focus focus:border-input-focus"
            />
          </div>
        </div>

        {/* Review Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-background-secondary rounded border border-border">
          <input
            type="checkbox"
            id="officer-review"
            checked={isReviewed}
            onChange={handleReviewToggle}
            className="mt-1 w-4 h-4 rounded border-border bg-input-background accent-primary cursor-pointer"
          />
          <label htmlFor="officer-review" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">
                Reviewed by Authorized Officer
              </span>
              {isReviewed && (
                <CheckCircle className="w-4 h-4 text-severity-low" />
              )}
            </div>
            <p className="text-sm text-foreground-secondary mt-1">
              I confirm that I have reviewed the risk assessment and suggested actions
            </p>
          </label>
        </div>

        {/* Auto-Generated Review Details (Read-Only) */}
        <div className="bg-background-tertiary p-3 rounded border border-border-secondary grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">Review ID</label>
            <div className="font-mono text-sm text-foreground">RVW-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-{Math.floor(Math.random() * 1000).toString().padStart(4, '0')}</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">Timestamp</label>
            <div className="font-mono text-sm text-foreground">{new Date().toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Notes Area */}
        <div className="space-y-2">
          <label htmlFor="officer-notes" className="block text-sm font-medium text-foreground">
            Review Notes
          </label>
          <textarea
            id="officer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Enter review comments, decisions taken, or additional observations..."
            className="w-full px-4 py-3 bg-input-background border border-input-border rounded text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-input-focus focus:border-input-focus resize-none"
          />
          <p className="text-xs text-foreground-tertiary">
            These notes will be included in the audit log along with the Review ID.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            disabled={!isReviewed || !notes.trim() || !officerName.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button variant="ghost" onClick={handleClear} disabled={submitting}>
            Clear
          </Button>
        </div>

        {/* Audit Log Preview */}
        <div className="pt-6 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-foreground-secondary" />
            <h4 className="text-foreground">Recent Audit Log</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {auditLog.length > 0 ? (
              auditLog.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 bg-background-secondary rounded border border-border-subtle text-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <span className="text-foreground-secondary font-medium">{entry.officer}</span>
                    <span className="text-xs text-foreground-tertiary">{entry.timestamp}</span>
                  </div>
                  <p className="text-foreground-secondary">{entry.action}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-foreground-tertiary text-center py-4">
                No audit log entries yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}