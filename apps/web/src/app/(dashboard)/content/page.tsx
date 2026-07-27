'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Lightbulb, MessageSquare, Sparkles, Video, Wand2 } from 'lucide-react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const tools = [
  { id: 'caption', label: 'Caption Generator', icon: MessageSquare, desc: 'Natural, human-sounding captions' },
  { id: 'hashtags', label: 'Hashtag Suggester', icon: Hash, desc: 'Mixed-tier hashtag strategy' },
  { id: 'idea', label: 'Idea Analyzer', icon: Lightbulb, desc: 'Evaluate content ideas' },
  { id: 'hook', label: 'Reel Hook Generator', icon: Video, desc: 'Spoken-style Reel hooks' },
  { id: 'humanize', label: 'Humanizer', icon: Wand2, desc: 'Make any text sound more human' },
];

const VOICE_PROFILES = [
  { id: 'casual', label: 'Casual', desc: 'Like texting a friend' },
  { id: 'storyteller', label: 'Storyteller', desc: 'Micro-stories & moments' },
  { id: 'expert', label: 'Expert', desc: 'Confident, no jargon' },
  { id: 'witty', label: 'Witty', desc: 'Light humor & personality' },
  { id: 'warm', label: 'Warm', desc: 'Genuine & encouraging' },
];

export default function ContentPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [activeTool, setActiveTool] = useState('caption');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [humanScore, setHumanScore] = useState<number | null>(null);
  const [voiceProfile, setVoiceProfile] = useState('casual');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.content.getVoiceProfiles(token).catch(() => {});
  }, [token]);

  async function handleGenerate() {
    if (!token) return;
    setLoading(true);
    setResult('');
    setHumanScore(null);
    try {
      const opts = { voiceProfile, humanize: true };
      switch (activeTool) {
        case 'caption': {
          const res = await api.content.generateCaption(token, { topic, tone: 'engaging', ...opts });
          setResult(res.caption || '');
          setHumanScore(res.humanScore ?? null);
          break;
        }
        case 'hashtags': {
          const res = await api.content.suggestHashtags(token, { content: content || topic, ...opts });
          setResult(Array.isArray(res.hashtags) ? res.hashtags.map((h) => `#${h}`).join(' ') : '');
          setHumanScore(res.humanScore ?? null);
          break;
        }
        case 'idea': {
          const res = await api.content.analyzeIdea(token, { idea: topic, ...opts });
          setResult(res.analysis || '');
          setHumanScore(res.humanScore ?? null);
          break;
        }
        case 'hook': {
          const res = await api.content.generateReelHook(token, { topic, voiceProfile: voiceProfile === 'casual' ? 'witty' : voiceProfile });
          setResult(res.hooks || '');
          setHumanScore(res.humanScore ?? null);
          break;
        }
        case 'humanize': {
          const res = await api.content.humanize(token, { text: content || topic, voiceProfile });
          setResult(res.text || '');
          setHumanScore(res.humanScore ?? null);
          break;
        }
      }
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar title="AI Content Assistant" />
      <div className="p-8">
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Human Voice Engine — content optimized to sound authentically human, not AI-generated</span>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTool(tool.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                activeTool === tool.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <tool.icon className={`mb-2 h-5 w-5 ${activeTool === tool.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium">{tool.label}</p>
              <p className="text-xs text-muted-foreground">{tool.desc}</p>
            </motion.button>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{tools.find((t) => t.id === activeTool)?.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Voice Profile</Label>
              <div className="flex flex-wrap gap-2">
                {VOICE_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setVoiceProfile(p.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                      voiceProfile === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {activeTool === 'hashtags' ? 'Content Description' : activeTool === 'humanize' ? 'Text to Humanize' : 'Topic / Idea'}
              </Label>
              {activeTool === 'humanize' ? (
                <textarea
                  value={content || topic}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste AI-generated or draft text here..."
                  className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              ) : (
                <Input
                  value={activeTool === 'hashtags' ? content || topic : topic}
                  onChange={(e) => activeTool === 'hashtags' ? setContent(e.target.value) : setTopic(e.target.value)}
                  placeholder="e.g., Morning routine for productivity..."
                />
              )}
            </div>

            <Button onClick={handleGenerate} disabled={loading || (!topic && !content)}>
              {loading ? 'Generating...' : activeTool === 'humanize' ? 'Humanize Text' : 'Generate'}
            </Button>

            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border bg-muted p-4">
                {humanScore !== null && (
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant={humanScore < 30 ? 'success' : humanScore < 50 ? 'warning' : 'secondary'}>
                      Human Score: {humanScore}/100
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {humanScore < 30 ? 'Sounds natural' : humanScore < 50 ? 'Mostly human' : 'Could be more natural'}
                    </span>
                  </div>
                )}
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
