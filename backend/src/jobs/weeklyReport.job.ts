import cron from 'node-cron';
import prisma from '../config/database';
import { reportService } from '../services/ai/report.service';

/**
 * Weekly Report Job
 * Runs every Sunday at 00:00 UTC
 */
export const initWeeklyReportJob = () => {
    // 0 0 * * 0 = Every Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
        console.log('[JOBS] Starting weekly report generation for all eligible users...');
        
        try {
            // Find all users with a paid plan
            const users = await prisma.user.findMany({
                where: {
                    subscriptionTier: { in: ['pro', 'elite'] }
                },
                select: { id: true, email: true }
            });

            console.log(`[JOBS] Found ${users.length} eligible users. Processing...`);

            for (const user of users) {
                try {
                    await reportService.generateAndSaveWeeklyReport(user.id);
                    console.log(`[JOBS] Successfully generated report for user ${user.id} (${user.email})`);
                } catch (userError) {
                    console.error(`[JOBS] Failed to generate report for user ${user.id}:`, userError);
                }
            }

            console.log('[JOBS] Weekly report generation completed.');
        } catch (error) {
            console.error('[JOBS] CRITICAL ERROR in Weekly Report Job:', error);
        }
    });

    console.log('[JOBS] Weekly Report Cron Job initialized (Every Sunday at 00:00 UTC)');
};
