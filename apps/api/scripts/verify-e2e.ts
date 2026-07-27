/**
 * Cherry-Up End-to-End Verification Script
 * Tests all critical API flows to confirm the app works.
 *
 * Usage: npx ts-node scripts/verify-e2e.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, detail });
    console.log(`  ✗ ${name} — ${detail}`);
  }
}

async function api(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/v1${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status}: ${body.message || JSON.stringify(body)}`);
  return body;
}

let token = '';

async function main() {
  console.log('\n🔍 Cherry-Up E2E Verification\n');
  console.log(`API: ${API_URL}`);
  console.log(`AI:  ${AI_URL}\n`);

  // ── AI Service ──
  console.log('AI Service:');
  await runTest('Health check', async () => {
    const res = await fetch(`${AI_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Not healthy');
  });

  await runTest('Voice profiles endpoint', async () => {
    const res = await fetch(`${AI_URL}/api/v1/content/voice-profiles`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.profiles?.length) throw new Error('No profiles returned');
  });

  await runTest('Caption generation (demo mode)', async () => {
    const res = await fetch(`${AI_URL}/api/v1/content/caption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'morning coffee routine', voiceProfile: 'casual' }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.caption) throw new Error('No caption returned');
  });

  await runTest('Humanize text', async () => {
    const res = await fetch(`${AI_URL}/api/v1/content/humanize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "In today's fast-paced world, let's dive into this game-changing content strategy.",
        voiceProfile: 'casual',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.text) throw new Error('No text returned');
    if (data.humanScore === undefined) throw new Error('No humanScore');
  });

  // ── Auth ──
  console.log('\nAuthentication:');
  await runTest('Login with demo account', async () => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'demo@cherry-up.com', password: 'Demo123!' }),
    });
    if (!data.accessToken) throw new Error('No access token');
    token = data.accessToken;
  });

  await runTest('Login with admin account', async () => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@cherry-up.com', password: 'Admin123!' }),
    });
    if (!data.accessToken) throw new Error('No access token');
  });

  await runTest('Reject invalid credentials', async () => {
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'demo@cherry-up.com', password: 'wrong' }),
      });
      throw new Error('Should have failed');
    } catch (err) {
      if (err instanceof Error && err.message.includes('Should have failed')) throw err;
    }
  });

  // ── Dashboard ──
  console.log('\nDashboard & Analytics:');
  await runTest('Get dashboard overview', async () => {
    const data = await api('/dashboard', {}, token);
    if (!data.metrics) throw new Error('No metrics');
    if (data.metrics.totalFollowers === undefined) throw new Error('No follower count');
  });

  await runTest('Get post analytics', async () => {
    const data = await api('/analytics/posts', {}, token);
    if (!data.summary) throw new Error('No summary');
  });

  await runTest('Compare content types', async () => {
    const data = await api('/analytics/content-types', {}, token);
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  await runTest('Get top topics', async () => {
    const data = await api('/analytics/topics', {}, token);
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ── Content AI (via API proxy) ──
  console.log('\nContent AI (via API):');
  await runTest('Generate caption', async () => {
    const data = await api('/content/caption', {
      method: 'POST',
      body: JSON.stringify({ topic: 'sunset photography tips', voiceProfile: 'casual' }),
    }, token);
    if (!data.caption) throw new Error('No caption');
    if (data.humanScore === undefined) throw new Error('No humanScore');
  });

  await runTest('Suggest hashtags', async () => {
    const data = await api('/content/hashtags', {
      method: 'POST',
      body: JSON.stringify({ content: 'travel photography from Iceland' }),
    }, token);
    if (!data.hashtags?.length) throw new Error('No hashtags');
  });

  await runTest('Get voice profiles', async () => {
    const data = await api('/content/voice-profiles', {}, token);
    if (!data.profiles?.length) throw new Error('No profiles');
  });

  // ── Audience ──
  console.log('\nAudience Intelligence:');
  await runTest('Get audience insights', async () => {
    const data = await api('/audience/insights', {}, token);
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ── Recommendations ──
  console.log('\nRecommendations:');
  await runTest('Get growth recommendations', async () => {
    const data = await api('/recommendations', {}, token);
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ── Competitors ──
  console.log('\nCompetitors:');
  await runTest('List competitors', async () => {
    const data = await api('/competitors', {}, token);
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ── Automation ──
  console.log('\nSafe Automation:');
  await runTest('Get trust score', async () => {
    const data = await api('/automation/trust-score', {}, token);
    if (data.trustScore === undefined) throw new Error('No trust score');
  });

  await runTest('List automation actions', async () => {
    const data = await api('/automation', {}, token);
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ── Notifications ──
  console.log('\nNotifications:');
  await runTest('Get notifications', async () => {
    const data = await api('/notifications', {}, token);
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // ── User Profile ──
  console.log('\nUser Profile:');
  await runTest('Get user profile', async () => {
    const data = await api('/users/me', {}, token);
    if (!data.email) throw new Error('No email');
  });

  // ── Summary ──
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${results.length} runTests`);

  if (failed > 0) {
    console.log('\nFailed runTests:');
    results.filter((r) => !r.passed).forEach((r) => console.log(`  ✗ ${r.name}: ${r.detail}`));
    process.exit(1);
  } else {
    console.log('\n✅ All runTests passed — Cherry-Up is working correctly!\n');
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
