import prisma from '../../config/database';
import { aiService } from './ai.service';
import { resend, EMAIL_FROM } from '../../config/resend';

export class ReportService {
  async generateAndSaveWeeklyReport(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSettings: true }
    });

    if (!user) throw new Error('User not found');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Generate AI content via aiService
    const aiData = await aiService.generateWeeklyReport(userId);
    
    // Check if we got back valid data (aiService returns an error summary if no trades)
    if (aiData.summary && aiData.summary.includes("No trades")) {
        return null;
    }

    // Save to DB
    const report = await prisma.aiReport.create({
      data: {
        userId,
        title: `Performance Report: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        periodStart: startDate,
        periodEnd: endDate,
        weekSummary: aiData.performanceOverview || '',
        behavioralAlert: aiData.patternDetection || '',
        nextWeekFocus: aiData.nextWeekFocus || '',
        bestSetup: aiData.tradeOfTheWeek || '',
        fullContent: JSON.stringify(aiData),
        geminiModel: user.subscriptionTier === 'elite' ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
      }
    });

    // Send email if enabled
    if (user.userSettings?.emailWeeklyReport && resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM || 'reports@trade-journal.com',
          to: user.email,
          subject: `Weekly Performance Analysis — ${user.name || 'Trader'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
              <h1 style="color: #6366f1;">Your AI Weekly Report is Ready</h1>
              <p style="font-size: 16px; line-height: 1.5;">${aiData.performanceOverview}</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Next Week's Focus:</h3>
                <p>${aiData.nextWeekFocus}</p>
              </div>
              <a href="${process.env.FRONTEND_URL}/dashboard/reports/${report.id}" 
                 style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                View Full Analysis
              </a>
            </div>
          `
        });

        await prisma.aiReport.update({
          where: { id: report.id },
          data: { emailSent: true, emailSentAt: new Date() }
        });
      } catch (error) {
        console.error('Failed to send report email:', error);
      }
    }

    return report;
  }

  async getUserReports(userId: string) {
    return prisma.aiReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getReportById(id: string, userId: string) {
    return prisma.aiReport.findFirst({
      where: { id, userId }
    });
  }
}

export const reportService = new ReportService();
