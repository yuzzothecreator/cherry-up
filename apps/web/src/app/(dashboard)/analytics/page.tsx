'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AnalyticsPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [contentTypes, setContentTypes] = useState<Array<{ type: string; count: number; avgEngagement: number }>>([]);
  const [topics, setTopics] = useState<Array<{ topic: string; count: number; avgScore: number }>>([]);
  const [posts, setPosts] = useState<{ summary: Record<string, number>; posts: Array<Record<string, unknown>> } | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.analytics.getContentTypes(token),
      api.analytics.getTopics(token),
      api.analytics.getPosts(token),
    ]).then(([types, tops, postData]) => {
      setContentTypes(types as typeof contentTypes);
      setTopics(tops as typeof topics);
      setPosts(postData as typeof posts);
    }).catch(console.error);
  }, [token]);

  return (
    <>
      <TopBar title="Content Analytics" />
      <div className="p-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Posts', value: posts?.summary?.totalPosts || 0 },
            { label: 'Avg Likes', value: posts?.summary?.avgLikes || 0 },
            { label: 'Avg Comments', value: posts?.summary?.avgComments || 0 },
            { label: 'Avg Engagement', value: `${posts?.summary?.avgEngagementRate || 0}%` },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Content Type Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentTypes}>
                  <XAxis dataKey="type" stroke="#52525b" fontSize={12} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0f0f12', border: '1px solid #27272a', borderRadius: '8px' }} />
                  <Bar dataKey="avgEngagement" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Performing Topics</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topics.map((t) => (
                <div key={t.topic} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{t.topic}</Badge>
                    <span className="text-xs text-muted-foreground">{t.count} posts</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Score: {t.avgScore}</span>
                </div>
              ))}
              {topics.length === 0 && <p className="text-sm text-muted-foreground">No topic data available yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
