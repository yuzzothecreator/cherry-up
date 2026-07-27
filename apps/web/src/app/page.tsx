'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Shield, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Track performance, compare content types, and uncover what drives growth.' },
  { icon: Brain, title: 'AI Content Assistant', desc: 'Generate captions, hashtags, Reel hooks, and posting strategies.' },
  { icon: TrendingUp, title: 'Audience Intelligence', desc: 'ML-powered audience scoring to identify your most valuable followers.' },
  { icon: Shield, title: 'Safe Automation', desc: 'User-approved actions with rate limiting and trust scoring. No spam.' },
  { icon: Sparkles, title: 'Growth Recommendations', desc: 'Personalized AI recommendations for content, timing, and engagement.' },
  { icon: Zap, title: 'Competitor Analysis', desc: 'Analyze public competitor data and generate strategy reports.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 z-50 w-full glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">C</div>
            <span className="text-lg font-semibold">Cherry-Up</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 grid-pattern">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              GrowthAI — Ethical Instagram Growth
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
              Grow your Instagram with{' '}
              <span className="gradient-text">intelligence</span>, not spam
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Cherry-Up combines AI-powered analytics, content intelligence, and safe automation
              to help creators, brands, and businesses grow authentically.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">View Demo</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Cherry-Up. Ethical growth, powered by AI.
        </div>
      </footer>
    </div>
  );
}
