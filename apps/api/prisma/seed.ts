import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cherry-Up database...');

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const userPassword = await bcrypt.hash('Demo123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cherry-up.com' },
    update: {},
    create: {
      email: 'admin@cherry-up.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
      profile: { create: { firstName: 'Admin', lastName: 'User' } },
      subscription: { create: { plan: 'ENTERPRISE', status: 'ACTIVE' } },
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cherry-up.com' },
    update: {},
    create: {
      email: 'demo@cherry-up.com',
      passwordHash: userPassword,
      role: UserRole.USER,
      emailVerified: true,
      profile: { create: { firstName: 'Demo', lastName: 'Creator', company: 'Cherry Studios' } },
      subscription: { create: { plan: 'PRO', status: 'ACTIVE' } },
    },
  });

  const account = await prisma.socialAccount.upsert({
    where: {
      userId_platform_username: {
        userId: demoUser.id,
        platform: 'INSTAGRAM',
        username: 'cherrycreator',
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      username: 'cherrycreator',
      displayName: 'Cherry Creator',
      isConnected: true,
      followerCount: 15420,
      followingCount: 892,
      postCount: 234,
      metadata: { previousFollowerCount: 14800 },
    },
  });

  await prisma.accountHealth.upsert({
    where: { socialAccountId: account.id },
    update: {},
    create: {
      socialAccountId: account.id,
      overallScore: 78,
      contentScore: 82,
      engagementScore: 74,
      growthScore: 76,
      consistencyScore: 80,
    },
  });

  const postTypes = ['IMAGE', 'REEL', 'CAROUSEL', 'VIDEO'] as const;
  for (let i = 0; i < 12; i++) {
    const type = postTypes[i % postTypes.length];
    const likes = Math.floor(Math.random() * 2000) + 200;
    const comments = Math.floor(Math.random() * 150) + 10;
    const reach = Math.floor(Math.random() * 10000) + 1000;

    const post = await prisma.post.create({
      data: {
        socialAccountId: account.id,
        type,
        caption: `Sample post #${i + 1} about growth and creativity`,
        likes,
        comments,
        shares: Math.floor(Math.random() * 50),
        saves: Math.floor(Math.random() * 100),
        reach,
        impressions: reach * 1.5,
        engagementRate: ((likes + comments) / reach) * 100,
        hashtags: ['#growth', '#instagram', '#creator', '#cherryup'],
        postedAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.contentAnalysis.create({
      data: {
        postId: post.id,
        sentiment: 'positive',
        topics: ['growth', 'creativity', 'lifestyle'],
        hookStrength: 70 + Math.random() * 25,
        captionQuality: 65 + Math.random() * 30,
        hashtagScore: 60 + Math.random() * 35,
        performanceScore: 70 + Math.random() * 25,
        aiSummary: 'Strong engagement driven by relatable content and optimal posting time.',
      },
    });
  }

  await prisma.audienceInsight.create({
    data: {
      socialAccountId: account.id,
      interestRelevance: 82,
      engagementActivity: 76,
      accountQuality: 85,
      nicheSimilarity: 79,
      audienceScore: 80.5,
      topInterests: ['photography', 'lifestyle', 'travel', 'fashion'],
      demographics: { ageGroups: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 } },
      activeHours: { '6': 20, '12': 35, '18': 80, '21': 65 },
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
    },
  });

  const recommendations = [
    { type: 'CONTENT' as const, title: 'Create a Reel series', description: 'Your Reels get 2.3x more engagement than static posts.', priority: 9 },
    { type: 'POSTING_TIME' as const, title: 'Post at 6 PM', description: 'Peak audience activity detected between 6-8 PM.', priority: 8 },
    { type: 'ENGAGEMENT' as const, title: 'Use carousel posts', description: 'Carousels drive 1.4x more saves in your niche.', priority: 7 },
    { type: 'GROWTH' as const, title: 'Collaborate with micro-influencers', description: 'Partnerships could expand reach by 15-20%.', priority: 6 },
  ];

  for (const rec of recommendations) {
    await prisma.recommendation.create({
      data: { socialAccountId: account.id, ...rec },
    });
  }

  await prisma.competitor.createMany({
    data: [
      { socialAccountId: account.id, username: 'competitor_one', followerCount: 25000, engagementRate: 3.2 },
      { socialAccountId: account.id, username: 'competitor_two', followerCount: 18000, engagementRate: 4.1 },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, type: 'DASHBOARD', title: 'Welcome to Cherry-Up!', message: 'Connect your Instagram to unlock full analytics.' },
      { userId: demoUser.id, type: 'MILESTONE', title: '15K Followers!', message: 'You reached 15,000 followers. Keep growing!' },
    ],
  });

  console.log('Seed complete!');
  console.log(`Admin: admin@cherry-up.com / Admin123!`);
  console.log(`Demo:  demo@cherry-up.com / Demo123!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
