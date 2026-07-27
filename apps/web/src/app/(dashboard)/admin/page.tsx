'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AdminPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<{ users: Array<{ email: string; role: string; isActive: boolean }> } | null>(null);

  useEffect(() => {
    if (!token) return;
    api.admin.getAnalytics(token).then(setAnalytics).catch(console.error);
    api.admin.getUsers(token).then(setUsers).catch(console.error);
  }, [token]);

  const aiUsage = analytics?.aiUsage as { totalRequests: number; totalTokens: number; totalCost: number } | undefined;

  return (
    <>
      <TopBar title="Admin Panel" />
      <div className="p-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Users', value: analytics?.totalUsers || 0 },
            { label: 'Active Users', value: analytics?.activeUsers || 0 },
            { label: 'Total Posts', value: analytics?.totalPosts || 0 },
            { label: 'AI Requests', value: aiUsage?.totalRequests || 0 },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{String(stat.value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users?.users?.map((u, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm">{u.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{u.role}</span>
                    <span className={`text-xs ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
