'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Lightbulb, MessageSquare, Video } from 'lucide-react';
import { TopBar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const tools = [
  { id: 'caption', label: 'Caption Generator', icon: MessageSquare, desc: 'AI-powered Instagram captions' },
  { id: 'hashtags', label: 'Hashtag Suggester', icon: Hash, desc: 'Optimized hashtag recommendations' },
  { id: 'idea', label: 'Idea Analyzer', icon: Lightbulb, desc: 'Evaluate content ideas' },
  { id: 'hook', label: 'Reel Hook Generator', icon: Video, desc: 'Scroll-stopping Reel hooks' },
];

export default function ContentPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [activeTool, setActiveTool] = useState('caption');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!token) return;
    setLoading(true);
    setResult('');
    try {
      switch (activeTool) {
        case 'caption': {
          const res = await api.content.generateCaption(token, { topic, tone: 'engaging' }) as Record<string, string>;
          setResult(res.caption || '');
          break;
        }
        case 'hashtags': {
          const res = await api.content.suggestHashtags(token, { content: content || topic }) as { hashtags?: string[] };
          setResult(Array.isArray(res.hashtags) ? res.hashtags.map((h) => `#${h}`).join(' ') : '');
          break;
        }
        case 'idea': {
          const res = await api.content.analyzeIdea(token, { idea: topic }) as Record<string, string>;
          setResult(res.analysis || '');
          break;
        }
        case 'hook': {
          const res = await api.content.generateReelHook(token, { topic }) as Record<string, string>;
          setResult(res.hooks || '');
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
        <div className="grid gap-4 md:grid-cols-4">
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
              <Label>{activeTool === 'hashtags' ? 'Content Description' : 'Topic / Idea'}</Label>
              <Input
                value={activeTool === 'hashtags' ? content || topic : topic}
                onChange={(e) => activeTool === 'hashtags' ? setContent(e.target.value) : setTopic(e.target.value)}
                placeholder="e.g., Morning routine for productivity..."
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading || (!topic && !content)}>
              {loading ? 'Generating...' : 'Generate'}
            </Button>
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border bg-muted p-4">
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
