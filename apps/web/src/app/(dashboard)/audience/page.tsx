'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface AudienceInsight {
  audienceScore: number;
  interestRelevance: number;
  engagementActivity: number;
  accountQuality: number;
  nicheSimilarity: number;
  topInterests: string[];
}

export default function AudiencePage() {
  const token = useAuthStore((s) => s.accessToken);
  const [insight, setInsight] = useState<AudienceInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.audience.getInsights(token).then((data) => {
      if (data.length > 0) setInsight(data[0] as unknown as AudienceInsight);
    }).catch(console.error);
  }, [token]);

  async function calculateScore() {
    if (!token) return;
    setLoading(true);
    try {
      const result = await api.audience.calculateScore(token);
      setInsight(result as unknown as AudienceInsight);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const scores = insight ? [
    { label: 'Interest Relevance', value: insight.interestRelevance },
    { label: 'Engagement Activity', value: insight.engagementActivity },
    { label: 'Account Quality', value: insight.accountQuality },
    { label: 'Niche Similarity', value: insight.nicheSimilarity },
  ] : [];

  return (
    <>
      <TopBar title="Audience Intelligence" />
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">ML-powered audience scoring and insights</p>
          <Button onClick={calculateScore} disabled={loading}>
            {loading ? 'Calculating...' : 'Recalculate Score'}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Audience Score</CardTitle></CardHeader>
            <CardContent className="text-center">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-6xl font-bold gradient-text">
                {insight?.audienceScore?.toFixed(1) || '—'}
              </motion.div>
              <p className="mt-2 text-sm text-muted-foreground">out of 100</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {scores.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">{s.value}</span>
                  </div>
                  <Progress value={s.value} />
                </div>
              ))}
              {!insight && <p className="text-sm text-muted-foreground">Calculate your audience score to see breakdown.</p>}
            </CardContent>
          </Card>
        </div>

        {insight?.topInterests && (
          <Card className="mt-6">
            <CardHeader><CardTitle>Top Audience Interests</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insight.topInterests.map((interest) => (
                  <span key={interest} className="rounded-full border border-border bg-muted px-3 py-1 text-sm">{interest}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
