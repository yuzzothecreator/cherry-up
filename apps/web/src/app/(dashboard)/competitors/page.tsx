'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatNumber } from '@/lib/utils';

interface Competitor {
  id: string;
  username: string;
  followerCount: number;
  engagementRate: number;
  postFrequency: number;
  topTopics: string[];
}

export default function CompetitorsPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!token) return;
    api.competitors.getAll(token).then(setCompetitors).catch(console.error);
  }, [token]);

  async function addCompetitor() {
    if (!token || !username) return;
    await api.competitors.add(token, username);
    setUsername('');
    const updated = await api.competitors.getAll(token);
    setCompetitors(updated);
  }

  async function analyze(id: string) {
    if (!token) return;
    await api.competitors.analyze(token, id);
    const updated = await api.competitors.getAll(token);
    setCompetitors(updated);
  }

  return (
    <>
      <TopBar title="Competitor Analysis" />
      <div className="p-8">
        <div className="mb-6 flex gap-2">
          <Input placeholder="@competitor_username" value={username} onChange={(e) => setUsername(e.target.value)} className="max-w-xs" />
          <Button onClick={addCompetitor}>Track Competitor</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {competitors.map((comp) => (
            <Card key={comp.id}>
              <CardHeader>
                <CardTitle>@{comp.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{formatNumber(comp.followerCount)}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{comp.engagementRate}%</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{comp.postFrequency}/wk</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>
                {comp.topTopics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {comp.topTopics.map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">{t}</span>
                    ))}
                  </div>
                )}
                <Button size="sm" variant="outline" className="mt-4" onClick={() => analyze(comp.id)}>
                  Analyze
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {competitors.length === 0 && (
          <p className="text-sm text-muted-foreground">Add competitors to start analyzing their public strategies.</p>
        )}
      </div>
    </>
  );
}
