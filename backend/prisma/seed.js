"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Seed demo user
    const passwordHash = await bcryptjs_1.default.hash('Demo1234!', 12);
    const user = await prisma.user.upsert({
        where: { email: 'demo@tradejournal.com' },
        update: {},
        create: {
            email: 'demo@tradejournal.com',
            name: 'Demo Trader',
            passwordHash,
            subscriptionTier: 'pro',
            onboardingCompleted: true,
            tradingExperience: 'intermediate',
            primaryAssetClass: 'stocks',
            userSettings: {
                create: {
                    emailWeeklyReport: true,
                    defaultDateRange: '30d',
                    showCommissions: true,
                },
            },
        },
    });
    console.log(`✅ Created user: ${user.email}`);
    // Seed default trading account
    const account = await prisma.tradingAccount.upsert({
        where: { id: 'seed-account-00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: 'seed-account-00000000-0000-0000-0000-000000000001',
            userId: user.id,
            name: 'Main Account',
            broker: 'Interactive Brokers',
            accountType: 'live',
            currency: 'USD',
            initialBalance: 50000,
            currentBalance: 52345.67,
        },
    });
    console.log(`✅ Created trading account: ${account.name}`);
    // Seed sample tags
    const tagData = [
        { name: 'Breakout', color: '#00FF87', category: 'setup' },
        { name: 'Trend Follow', color: '#3B82F6', category: 'setup' },
        { name: 'FOMO', color: '#EF4444', category: 'emotion' },
        { name: 'High Conviction', color: '#8B5CF6', category: 'setup' },
        { name: 'News Play', color: '#F59E0B', category: 'setup' },
    ];
    for (const tag of tagData) {
        await prisma.tag.upsert({
            where: { userId_name: { userId: user.id, name: tag.name } },
            update: {},
            create: { ...tag, userId: user.id },
        });
    }
    console.log(`✅ Created ${tagData.length} tags`);
    console.log('\n🎉 Seed complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map