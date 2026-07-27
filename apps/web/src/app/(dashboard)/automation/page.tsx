'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface AutomationAction {
  id: string;
  type: string;
  status: string;
  trustScore: number;
  createdAt: string;
  payload: Record<string, unknown>;
}

export default function AutomationPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [trustScore, setTrustScore] = useState(100);

  useEffect(() => {
    if (!token) return;
    api.automation.getActions(token).then(setActions).catch(console.error);
    api.automation.getTrustScore(token).then((d: { trustScore: number }) => setTrustScore(d.trustScore)).catch(console.error);
  }, [token]);

  async function handleApprove(id: string) {
    if (!token) return;
    await api.automation.approve(token, id);
    const updated = await api.automation.getActions(token);
    setActions(updated);
  }

  async function handleReject(id: string) {
    if (!token) return;
    await api.automation.reject(token, id);
    const updated = await api.automation.getActions(token);
    setActions(updated);
  }

  async function createDraftAction() {
    if (!token) return;
    await api.automation.create(token, {
      type: 'DRAFT_CAPTION',
      payload: { topic: 'Weekly growth tips', tone: 'professional' },
    });
    const updated = await api.automation.getActions(token);
    setActions(updated);
  }

  const statusVariant = (status: string) => {
    if (status === 'APPROVED') return 'success' as const;
    if (status === 'PENDING_APPROVAL') return 'warning' as const;
    return 'secondary' as const;
  };

  return (
    <>
      <TopBar title="Safe Automation" />
      <div className="p-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Trust Score</p>
              <p className="text-3xl font-bold gradient-text">{trustScore}</p>
              <Progress value={trustScore} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-3xl font-bold">{actions.filter((a) => a.status === 'PENDING_APPROVAL').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Policy</p>
              <p className="text-sm mt-2">All actions require user approval. No spam or bot activity.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <Button onClick={createDraftAction}>Create Draft Caption Action</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Automation Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(action.status)}>{action.status.replace('_', ' ')}</Badge>
                    <span className="text-sm font-medium">{action.type.replace('_', ' ')}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Trust: {action.trustScore} &middot; {new Date(action.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {action.status === 'PENDING_APPROVAL' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(action.id)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(action.id)}>Reject</Button>
                  </div>
                )}
              </div>
            ))}
            {actions.length === 0 && <p className="text-sm text-muted-foreground">No automation actions yet.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
