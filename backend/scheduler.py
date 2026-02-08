"""
Cron Job Scheduler

Manages all scheduled automation tasks.
"""

import os
from datetime import datetime
from typing import Callable, Dict
import asyncio

try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.cron import CronTrigger
    from apscheduler.triggers.interval import IntervalTrigger
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False


class AutomationScheduler:
    """Centralized scheduler for all automation tasks"""
    
    def __init__(
        self,
        db_connection,
        data_ingestion,
        report_generator,
        webhook_service
    ):
        self.db = db_connection
        self.data_ingestion = data_ingestion
        self.reports = report_generator
        self.webhooks = webhook_service
        
        if SCHEDULER_AVAILABLE:
            self.scheduler = AsyncIOScheduler()
            self.enabled = True
        else:
            self.scheduler = None
            self.enabled = False
    
    def setup_jobs(self):
        """Setup all scheduled jobs"""
        if not self.enabled:
            print("Scheduler not available")
            return
        
        # Data ingestion jobs
        self._setup_data_ingestion_jobs()
        
        # Report generation jobs
        self._setup_report_jobs()
        
        # Maintenance jobs
        self._setup_maintenance_jobs()
        
        print("Scheduled jobs configured:")
        for job in self.scheduler.get_jobs():
            print(f"  - {job.id}: {job.trigger}")
    
    def _setup_data_ingestion_jobs(self):
        """Setup data ingestion schedules"""
        # Every 4 hours: Ingest Twitter + News
        self.scheduler.add_job(
            self._ingest_all_sources,
            trigger=IntervalTrigger(hours=4),
            id='ingest_all_sources',
            name='Ingest from all sources',
            replace_existing=True
        )
    
    def _setup_report_jobs(self):
        """Setup report generation schedules"""
        # Daily at 6:00 AM: Send daily digest
        self.scheduler.add_job(
            self._send_daily_digest,
            trigger=CronTrigger(hour=6, minute=0),
            id='daily_digest',
            name='Daily digest email',
            replace_existing=True
        )
        
        # Weekly on Monday at 9:00 AM: Generate weekly reports
        self.scheduler.add_job(
            self._send_weekly_reports,
            trigger=CronTrigger(day_of_week='mon', hour=9, minute=0),
            id='weekly_reports',
            name='Weekly PDF reports',
            replace_existing=True
        )
        
        # Every 4 hours: Refresh materialized views
        self.scheduler.add_job(
            self._refresh_materialized_views,
            trigger=IntervalTrigger(hours=4),
            id='refresh_views',
            name='Refresh materialized views',
            replace_existing=True
        )
    
    def _setup_maintenance_jobs(self):
        """Setup maintenance schedules"""
        # Monthly on 1st at 2:00 AM: Archive old data
        self.scheduler.add_job(
            self._archive_old_data,
            trigger=CronTrigger(day=1, hour=2, minute=0),
            id='archive_data',
            name='Archive old signals',
            replace_existing=True
        )
        
        # Daily at 3:00 AM: Database optimization
        self.scheduler.add_job(
            self._optimize_database,
            trigger=CronTrigger(hour=3, minute=0),
            id='db_optimize',
            name='Database optimization',
            replace_existing=True
        )
    
    # Job implementations
    
    async def _ingest_all_sources(self):
        """Ingest data from all sources"""
        print(f"[{datetime.now()}] Starting data ingestion...")
        
        try:
            results = await self.data_ingestion.ingest_all_sources()
            print(f"Ingestion complete: {results}")
            
            # Trigger webhook if new signals found
            if results['total'] > 0:
                await self.webhooks.trigger_event(
                    'NEW_SIGNAL',
                    {
                        'source': 'automated_ingestion',
                        'count': results['total'],
                        'breakdown': results
                    }
                )
        except Exception as e:
            print(f"Data ingestion failed: {e}")
    
    async def _send_daily_digest(self):
        """Send daily digest emails"""
        print(f"[{datetime.now()}] Generating daily digest...")
        
        try:
            result = self.reports.generate_daily_digest()
            print(f"Daily digest sent: {result}")
        except Exception as e:
            print(f"Daily digest failed: {e}")
    
    async def _send_weekly_reports(self):
        """Send weekly PDF reports"""
        print(f"[{datetime.now()}] Generating weekly reports...")
        
        try:
            # Get all districts
            districts = self.db.query("SELECT DISTINCT district FROM risk_scores")
            
            for district_row in districts:
                district = district_row['district']
                success = self.reports.generate_weekly_report(district)
                print(f"Weekly report for {district}: {'sent' if success else 'failed'}")
                
        except Exception as e:
            print(f"Weekly reports failed: {e}")
    
    async def _refresh_materialized_views(self):
        """Refresh materialized views"""
        print(f"[{datetime.now()}] Refreshing materialized views...")
        
        try:
            self.db.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY daily_risk_scores")
            self.db.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY district_summary")
            print("Materialized views refreshed")
        except Exception as e:
            print(f"View refresh failed: {e}")
    
    async def _archive_old_data(self):
        """Archive signals older than 6 months"""
        print(f"[{datetime.now()}] Archiving old data...")
        
        try:
            result = self.db.query_one("SELECT archive_old_signals()")
            count = result['archive_old_signals']
            print(f"Archived {count} old signals")
        except Exception as e:
            print(f"Archival failed: {e}")
    
    async def _optimize_database(self):
        """Run database optimization"""
        print(f"[{datetime.now()}] Optimizing database...")
        
        try:
            # Analyze tables
            self.db.execute("ANALYZE signals")
            self.db.execute("ANALYZE risk_scores")
            self.db.execute("ANALYZE actions")
            
            # Vacuum (light)
            self.db.execute("VACUUM ANALYZE")
            
            print("Database optimization complete")
        except Exception as e:
            print(f"Database optimization failed: {e}")
    
    def start(self):
        """Start scheduler"""
        if not self.enabled:
            print("Scheduler not available")
            return
        
        self.scheduler.start()
        print("Scheduler started")
    
    def stop(self):
        """Stop scheduler"""
        if self.scheduler:
            self.scheduler.shutdown(wait=True)
            print("Scheduler stopped")
    
    def get_job_status(self) -> Dict:
        """Get status of all jobs"""
        if not self.enabled:
            return {"enabled": False}
        
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger)
            })
        
        return {
            'enabled': True,
            'running': self.scheduler.running,
            'jobs': jobs
        }
