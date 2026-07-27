'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [instagram, setInstagram] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.users.getProfile(token).then((profile) => {
      const account = profile.socialAccounts?.[0];
      if (account) {
        setInstagram(account.username);
        setConnected(account.isConnected);
      }
    }).catch(console.error);
  }, [token]);

  async function connectInstagram() {
    if (!token || !instagram) return;
    await api.socialAccounts.connect(token, instagram);
    setConnected(true);
  }

  return (
    <>
      <TopBar title="Settings" />
      <div className="p-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="text-muted-foreground">Email:</span> {user?.email}</p>
            <p className="text-sm"><span className="text-muted-foreground">Role:</span> {user?.role}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Instagram Connection</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram Username</Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourusername" />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={connectInstagram}>Connect Account</Button>
              {connected && <span className="text-sm text-emerald-400">Connected</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              Cherry-Up uses ethical data practices. We only access data you authorize and never perform spam actions.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
