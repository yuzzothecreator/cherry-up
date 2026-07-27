'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const impact = [
  {
    title: 'Grow engagement up to 3×',
    desc: 'AI finds what your audience actually responds to — hooks, formats, and topics that convert.',
  },
  {
    title: 'Cut content time by 60%',
    desc: 'Captions, hashtags, and Reel hooks drafted in your voice — then humanized before you post.',
  },
  {
    title: 'Stay algorithm-safe',
    desc: 'Trust scoring and approval gates. Growth without spam, bans, or fake follow bots.',
  },
];

const capabilities = [
  { icon: BarChart3, label: 'Deep Analytics' },
  { icon: Brain, label: 'AI Content' },
  { icon: Users, label: 'Audience Intel' },
  { icon: Shield, label: 'Safe Automation' },
  { icon: Sparkles, label: 'Recommendations' },
  { icon: Zap, label: 'Competitor Watch' },
];

const steps = [
  {
    icon: TrendingUp,
    title: 'Connect your goals',
    desc: 'Set niche, voice, and growth targets. Cherry-Up learns what “good” looks like for you.',
  },
  {
    icon: Brain,
    title: 'AI drafts & analyzes',
    desc: 'Content ideas, captions, timing, and audience insights — scored for human authenticity.',
  },
  {
    icon: Clock,
    title: 'You approve & grow',
    desc: 'Review suggestions, publish with confidence, and watch metrics compound over time.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$29',
    blurb: 'For creators getting serious about growth.',
    features: ['AI captions & hashtags', 'Basic analytics', '3 voice profiles', 'Weekly recommendations'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$79',
    blurb: 'Full intelligence for brands and teams.',
    features: [
      'Everything in Starter',
      'Audience intelligence',
      'Competitor analysis',
      'Safe automation queue',
      'Priority AI generation',
    ],
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-[0_0_20px_rgba(225,29,72,0.45)]">
              C
            </div>
            <span className="text-lg font-semibold tracking-tight">Cherry-Up</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#impact" className="transition-colors hover:text-foreground">
              Product
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-white/90"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — brand + one headline + one line + CTAs + dashboard visual */}
      <section className="relative pt-28 pb-8 md:pt-36 md:pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.12),transparent_55%)]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-4 text-sm font-medium tracking-[0.2em] text-primary uppercase">
              Cherry-Up
            </p>
            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl md:leading-[1.05]">
              Grow Instagram without the grind.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              AI analytics, content, and safe automation — so you grow with intelligence, not spam.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-white text-black hover:bg-white/90">
                  Start free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/15 bg-transparent">
                  View demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard visual plane */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-14 max-w-5xl"
          >
            <div className="hero-glow absolute inset-x-[-10%] bottom-[-20%] top-1/2 -z-10" />
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
              <div className="flex min-h-[280px] md:min-h-[360px]">
                <aside className="hidden w-48 shrink-0 border-r border-white/5 bg-black/40 p-4 sm:block">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-primary/90" />
                    <span className="text-xs font-semibold">Cherry-Up</span>
                  </div>
                  <div className="space-y-2">
                    {['Dashboard', 'Content', 'Analytics', 'Audience', 'Automation'].map((item, i) => (
                      <div
                        key={item}
                        className={`rounded-md px-3 py-2 text-left text-xs ${
                          i === 0 ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>
                <div className="flex-1 p-4 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Growth overview</p>
                      <p className="text-sm font-medium">Your Instagram health</p>
                    </div>
                    <div className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                      Score 86
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { label: 'Followers', value: '24.8K', delta: '+12%' },
                      { label: 'Engagement', value: '4.6%', delta: '+0.8%' },
                      { label: 'Reach', value: '182K', delta: '+31%' },
                      { label: 'Human score', value: '91', delta: 'Safe' },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left sm:p-4"
                      >
                        <p className="text-[11px] text-muted-foreground">{m.label}</p>
                        <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{m.value}</p>
                        <p className="mt-1 text-[11px] text-primary">{m.delta}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 hidden h-28 items-end gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex">
                    {[40, 55, 48, 70, 62, 78, 85, 72, 90, 88, 95, 92].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 8 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.4 + i * 0.04, duration: 0.5 }}
                        className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/5 py-8">
        <p className="mb-5 text-center text-xs tracking-widest text-muted-foreground uppercase">
          Built for creators who refuse fake growth
        </p>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 opacity-40">
          {['Creators', 'Brands', 'Agencies', 'Shops', 'Studios'].map((name) => (
            <span key={name} className="text-sm font-semibold tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Measurable impact across your growth workflow.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            One place for content intelligence, audience insight, and safe recommendations.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {impact.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="stripe-card rounded-2xl border border-primary/20 p-6"
              >
                <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {capabilities.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <c.icon className="h-4 w-4 text-primary" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            How Cherry-Up works in 3 steps
          </h2>
          <div className="steps-shell mt-12 rounded-[2rem] p-8 md:p-12">
            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="text-center md:text-left">
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary md:mx-0">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="mb-1 text-xs font-medium text-primary">Step {i + 1}</p>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing. Real growth tools.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Start free on demo data. Upgrade when you connect your workflow.
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${
                  plan.highlight
                    ? 'price-highlight border-primary/40'
                    : 'border-white/10 bg-card'
                }`}
              >
                <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.blurb}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8 block">
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    Get started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold">
                C
              </div>
              <span className="font-semibold">Cherry-Up</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Ethical Instagram growth — AI that helps you create, analyze, and improve without bots.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Product</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#impact" className="hover:text-foreground">Analytics</a></li>
              <li><a href="#impact" className="hover:text-foreground">Content AI</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Company</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
              <li><Link href="/register" className="hover:text-foreground">Register</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Get started</p>
            <Link href="/register">
              <Button size="sm" className="bg-white text-black hover:bg-white/90">
                Start free
              </Button>
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl px-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cherry-Up. Ethical growth, powered by AI.
        </p>
      </footer>
    </div>
  );
}
