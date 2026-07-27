'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, TrendingUp, Users } from 'lucide-react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatNumber, formatPercent } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardData {
  account: { username: string; displayName: string; followerCount: number } | null;
  metrics: { totalFollowers: number; growthRate: number; engagementRate: number; postsThisMonth: number };
  accountHealth: { overallScore: number; contentScore: number; engagementScore: number; growthScore: number; consistencyScore: number };
  recommendations: Array<{ id: string; title: string; description: string; type: string; priority: number }>;
  recentPosts: Array<{ id: string; type: string; likes: number; comments: number; engagementRate: number }>;
}

const chartData = [
  { day: 'Mon', followers: 14800, engagement: 3.2 },
  { day: 'Tue', followers: 14950, engagement: 3.5 },
  { day: 'Wed', followers: 15020, engagement: 3.8 },
  { day: 'Thu', followers: 15100, engagement: 4.1 },
  { day: 'Fri', followers: 15200, engagement: 3.9 },
  { day: 'Sat', followers: 15350, engagement: 4.5 },
  { day: 'Sun', followers: 15420, engagement: 4.2 },
];

export default function DashboardPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!token) return;
    api.dashboard.get(token).then((d) => setData(d as unknown as DashboardData)).catch(console.error);
  }, [token]);

  const metrics = data?.metrics || { totalFollowers: 0, growthRate: 0, engagementRate: 0, postsThisMonth: 0 };
  const health = data?.accountHealth || { overallScore: 0, contentScore: 0, engagementScore: 0, growthScore: 0, consistencyScore: 0 };

  const statCards = [
    { label: 'Total Followers', value: formatNumber(metrics.totalFollowers), change: formatPercent(metrics.growthRate), icon: Users, positive: metrics.growthRate >= 0 },
    { label: 'Growth Rate', value: formatPercent(metrics.growthRate), change: 'vs last month', icon: TrendingUp, positive: metrics.growthRate >= 0 },
    { label: 'Engagement Rate', value: `${metrics.engagementRate}%`, change: 'avg this month', icon: Heart, positive: true },
    { label: 'Posts This Month', value: metrics.postsThisMonth.toString(), change: 'published', icon: Activity, positive: true },
  ];

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="p-8">
        {data?.account && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <p className="text-sm text-muted-foreground">
              @{data.account.username} &middot; {data.account.displayName}
            </p>
          </motion.div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                      <p className={`mt-1 text-xs ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>{stat.change}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Growth Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#52525b" fontSize={12} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0f0f12', border: '1px solid #27272a', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="followers" stroke="#e11d48" fill="url(#colorFollowers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">{health.overallScore}</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              {[
                { label: 'Content', score: health.contentScore },
                { label: 'Engagement', score: health.engagementScore },
                { label: 'Growth', score: health.growthScore },
                { label: 'Consistency', score: health.consistencyScore },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.score}</span>
                  </div>
                  <Progress value={item.score} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Growth Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.recommendations || []).slice(0, 4).map((rec) => (
                <div key={rec.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Badge variant="default">{rec.type}</Badge>
                  <div>
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
              {(!data?.recommendations || data.recommendations.length === 0) && (
                <p className="text-sm text-muted-foreground">Connect your account to get personalized recommendations.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.recentPosts || []).slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{post.type}</Badge>
                    <span className="text-sm">{post.likes} likes &middot; {post.comments} comments</span>
                  </div>
                  <span className="text-sm text-emerald-400">{post.engagementRate.toFixed(1)}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
