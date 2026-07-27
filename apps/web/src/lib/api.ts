const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AutomationAction {
  id: string;
  type: string;
  status: string;
  trustScore: number;
  createdAt: string;
  payload: Record<string, unknown>;
}

interface Competitor {
  id: string;
  username: string;
  followerCount: number;
  engagementRate: number;
  postFrequency: number;
  topTopics: string[];
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/v1${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      ),
    register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
      request<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(data) },
      ),
  },
  dashboard: {
    get: (token: string) => request<Record<string, unknown>>('/dashboard', { token }),
  },
  content: {
    generateCaption: (token: string, data: { topic: string; tone?: string; niche?: string; voiceProfile?: string; humanize?: boolean }) =>
      request<{ caption: string; humanScore: number; voiceProfile: string }>('/content/caption', { method: 'POST', token, body: JSON.stringify(data) }),
    suggestHashtags: (token: string, data: { content: string; niche?: string; voiceProfile?: string }) =>
      request<{ hashtags: string[]; humanScore: number }>('/content/hashtags', { method: 'POST', token, body: JSON.stringify(data) }),
    analyzeIdea: (token: string, data: { idea: string; voiceProfile?: string }) =>
      request<{ analysis: string; humanScore: number }>('/content/analyze-idea', { method: 'POST', token, body: JSON.stringify(data) }),
    generateReelHook: (token: string, data: { topic: string; voiceProfile?: string }) =>
      request<{ hooks: string; humanScore: number }>('/content/reel-hook', { method: 'POST', token, body: JSON.stringify(data) }),
    humanize: (token: string, data: { text: string; voiceProfile?: string }) =>
      request<{ text: string; humanScore: number; improvement: number }>('/content/humanize', { method: 'POST', token, body: JSON.stringify(data) }),
    getVoiceProfiles: (token: string) =>
      request<{ profiles: Array<{ id: string; description: string }> }>('/content/voice-profiles', { token }),
  },
  analytics: {
    getPosts: (token: string) => request('/analytics/posts', { token }),
    getContentTypes: (token: string) => request('/analytics/content-types', { token }),
    getTopics: (token: string) => request('/analytics/topics', { token }),
    getReports: (token: string) => request('/analytics/reports', { token }),
  },
  audience: {
    getInsights: (token: string) => request<Array<Record<string, unknown>>>('/audience/insights', { token }),
    calculateScore: (token: string) => request<Record<string, unknown>>('/audience/score', { method: 'POST', token }),
  },
  automation: {
    getActions: (token: string) => request<AutomationAction[]>('/automation', { token }),
    create: (token: string, data: { type: string; payload: Record<string, unknown> }) =>
      request('/automation', { method: 'POST', token, body: JSON.stringify(data) }),
    approve: (token: string, id: string) =>
      request(`/automation/${id}/approve`, { method: 'POST', token }),
    reject: (token: string, id: string) =>
      request(`/automation/${id}/reject`, { method: 'POST', token }),
    getTrustScore: (token: string) => request<{ trustScore: number; activityNaturalness: { score: number; verdict: string; flags: string[] } }>('/automation/trust-score', { token }),
  },
  recommendations: {
    getAll: (token: string) => request<Array<Record<string, unknown>>>('/recommendations', { token }),
    generate: (token: string) => request<Array<Record<string, unknown>>>('/recommendations/generate', { method: 'POST', token }),
  },
  competitors: {
    getAll: (token: string) => request<Competitor[]>('/competitors', { token }),
    add: (token: string, username: string) =>
      request('/competitors', { method: 'POST', token, body: JSON.stringify({ username }) }),
    analyze: (token: string, id: string) =>
      request(`/competitors/${id}/analyze`, { method: 'POST', token }),
  },
  notifications: {
    getAll: (token: string) => request('/notifications', { token }),
    markRead: (token: string, id: string) =>
      request(`/notifications/${id}/read`, { method: 'POST', token }),
  },
  users: {
    getProfile: (token: string) => request<{ socialAccounts?: Array<{ username: string; isConnected: boolean }> }>('/users/me', { token }),
  },
  socialAccounts: {
    connect: (token: string, username: string) =>
      request('/social-accounts/connect', { method: 'POST', token, body: JSON.stringify({ username }) }),
  },
  admin: {
    getUsers: (token: string) => request<{ users: Array<{ email: string; role: string; isActive: boolean }> }>('/admin/users', { token }),
    getAnalytics: (token: string) => request<Record<string, unknown>>('/admin/analytics', { token }),
    getAiUsage: (token: string) => request<Record<string, unknown>>('/admin/ai-usage', { token }),
  },
};
