import { motion } from 'motion/react';
import { ShieldCheck, Zap, Brain, Coins, ArrowDown, CheckCircle2, Globe, Users, Database, Lock, BarChart3, Layers } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`max-w-5xl mx-auto ${className}`}>{children}</section>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-3">{children}</p>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none mb-6">{children}</h2>
);

export default function About() {
  return (
    <div className="space-y-32 pb-20">

      {/* ── HERO ── */}
      <Section>
        <motion.div {...fadeUp(0)} className="text-center space-y-6 py-10">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">Official Whitepaper</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter italic leading-none glow-text">
            NEXT<br /><span className="text-brand">Protocol</span>
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Transforming Human Feedback Into Verified Digital Value
          </p>
          <p className="text-white/40 max-w-3xl mx-auto leading-relaxed text-sm">
            NEXT Protocol is a blockchain-powered feedback and data intelligence platform that rewards people for sharing authentic opinions, completing surveys, participating in research activities, and contributing valuable real-world insights.
          </p>
          <p className="text-white/40 max-w-3xl mx-auto leading-relaxed text-sm">
            Built on the <span className="text-brand font-bold">Cardano blockchain</span>, NEXT creates a transparent ecosystem where users are rewarded for verified participation while organizations gain access to high-quality human-generated data.
          </p>
          <div className="pt-6 border-t border-white/5 max-w-lg mx-auto">
            <p className="text-white/30 text-xs uppercase tracking-widest font-bold mb-2">Our Mission</p>
            <p className="text-2xl font-black italic tracking-tight text-white">
              "Give people ownership of <span className="text-brand">the value they create.</span>"
            </p>
          </div>
        </motion.div>
      </Section>

      {/* ── PROBLEM ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>The Problem</SectionLabel>
          <SectionTitle>What We Are Solving</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Poor Quality Data */}
            <div className="glass-card rounded-[40px] p-8 border border-white/10 space-y-6">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <Database size={28} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight italic mb-3">Poor Quality Data</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-5">
                  Modern AI systems, research organizations, and businesses depend heavily on human-generated data. Unfortunately, many traditional platforms suffer from:
                </p>
                <ul className="space-y-2">
                  {['Fake accounts', 'Automated bots', 'Duplicate submissions', 'Low-quality responses', 'Geographic manipulation', 'Incentive abuse'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Unfair Data Ownership */}
            <div className="glass-card rounded-[40px] p-8 border border-white/10 space-y-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <Users size={28} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight italic mb-3">Unfair Data Ownership</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-5">
                  Millions of users generate valuable information every day through feedback, surveys, reviews, and online activities.
                </p>
                <p className="text-white/40 text-sm leading-relaxed">
                  Most platforms monetize this information while contributors receive little or no compensation. NEXT introduces a model where users are <span className="text-brand font-bold">rewarded directly</span> for verified contributions, creating a more balanced digital economy.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── SOLUTION ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Our Solution</SectionLabel>
          <SectionTitle>How NEXT Fixes It</SectionTitle>
          <div className="glass-card rounded-[40px] p-10 border border-brand/20 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none" />
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl mb-10">
              NEXT combines human intelligence, AI-powered validation, blockchain transparency, and reward-based participation. The platform verifies submitted information through multiple validation mechanisms before rewards are distributed.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Brain, label: 'Human Intelligence', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { icon: Zap, label: 'AI Validation', color: 'text-brand', bg: 'bg-brand/10' },
                { icon: Layers, label: 'Blockchain Transparency', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Coins, label: 'Reward Participation', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className="text-center space-y-3">
                  <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto`}>
                    <Icon size={28} className={color} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-wider text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Process</SectionLabel>
          <SectionTitle>How NEXT Works</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: '01', title: 'Participate', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10',
                desc: 'Users join the platform and complete available activities.',
                items: ['Surveys', 'Product feedback', 'Community research', 'Market research', 'Opinion polls', 'Verification tasks', 'Data contribution campaigns'],
              },
              {
                step: '02', title: 'Validation', icon: ShieldCheck, color: 'text-brand', bg: 'bg-brand/10',
                desc: 'Our intelligent verification system evaluates submissions for quality and authenticity.',
                items: ['Authenticity', 'Consistency', 'Quality', 'Completion', 'Trustworthiness'],
              },
              {
                step: '03', title: 'Earn Credits', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10',
                desc: 'Verified contributions generate XPS (Experience Points System) — the user\'s contribution score and reward balance within the ecosystem.',
                items: [],
              },
              {
                step: '04', title: 'Token Conversion', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10',
                desc: 'During approved reward events and platform milestones, accumulated XPS converts into blockchain-based rewards, bridging traditional web participation with decentralized ownership.',
                items: [],
              },
            ].map(({ step, title, icon: Icon, color, bg, desc, items }) => (
              <div key={step} className="glass-card rounded-[40px] p-8 border border-white/10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <Icon size={26} className={color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Step {step}</p>
                    <h3 className="text-xl font-black uppercase tracking-tight italic">{title}</h3>
                  </div>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                {items.length > 0 && (
                  <ul className="space-y-1.5 pt-2">
                    {items.map(i => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                        <CheckCircle2 size={12} className="text-brand shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── ARCHITECTURE DIAGRAM ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Architecture</SectionLabel>
          <SectionTitle>NEXT Ecosystem</SectionTitle>
          <div className="glass-card rounded-[40px] p-10 border border-white/10 flex flex-col items-center space-y-0">
            {[
              { label: 'Users', icon: Users, color: 'bg-brand/20 border-brand/30 text-brand' },
              { label: 'Feedback & Surveys', icon: null, color: 'bg-white/5 border-white/10 text-white/60' },
              { label: 'AI Verification Engine', icon: Brain, color: 'bg-purple-500/20 border-purple-500/30 text-purple-300' },
              { label: 'XPS Reward Ledger', icon: BarChart3, color: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
              { label: 'Token Conversion System', icon: Coins, color: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
              { label: 'Blockchain Settlement Layer', icon: Layers, color: 'bg-brand/20 border-brand/30 text-brand' },
            ].map(({ label, icon: Icon, color }, i, arr) => (
              <div key={label} className="flex flex-col items-center w-full max-w-xs">
                <div className={`w-full border rounded-2xl px-6 py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs ${color}`}>
                  {Icon && <Icon size={16} />}
                  {label}
                </div>
                {i < arr.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-px h-4 bg-white/10" />
                    <ArrowDown size={14} className="text-white/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── CORE COMPONENTS ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Platform</SectionLabel>
          <SectionTitle>Core Components</SectionTitle>
          <div className="space-y-4">
            {[
              { num: '1', title: 'User Dashboard', icon: BarChart3, items: ['Track earned rewards', 'View completed tasks', 'Monitor account activity', 'Access available opportunities'] },
              { num: '2', title: 'Survey & Feedback Engine', icon: Database, items: ['Research campaigns', 'Market studies', 'Community insights', 'User feedback programs'] },
              { num: '3', title: 'AI Verification Layer', icon: Brain, items: ['Quality assurance', 'Fraud prevention', 'Duplicate detection', 'Data validation'] },
              { num: '4', title: 'Reward Management System', icon: Coins, items: ['XPS balances', 'Reward history', 'Participation levels', 'Achievement milestones'] },
              { num: '5', title: 'Blockchain Settlement Layer', icon: Layers, items: ['Transparency', 'Security', 'Immutable reward records', 'Token distribution infrastructure'] },
            ].map(({ num, title, icon: Icon, items }) => (
              <div key={num} className="glass-card rounded-[32px] p-8 border border-white/10 flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 md:w-64 shrink-0">
                  <span className="text-4xl font-black text-white/10 leading-none">{num}.</span>
                  <div>
                    <Icon size={20} className="text-brand mb-2" />
                    <h3 className="text-base font-black uppercase tracking-tight italic">{title}</h3>
                  </div>
                </div>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                      <span className="w-1 h-1 rounded-full bg-brand/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── COMPARISON TABLE ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Differentiation</SectionLabel>
          <SectionTitle>Why NEXT Is Different</SectionTitle>
          <div className="glass-card rounded-[40px] overflow-hidden border border-white/10">
            <div className="grid grid-cols-2 text-xs font-black uppercase tracking-widest">
              <div className="p-6 bg-white/5 border-b border-r border-white/10 text-white/30">Traditional Platforms</div>
              <div className="p-6 bg-brand/10 border-b border-white/10 text-brand">NEXT Protocol</div>
              {[
                ['Users provide data for free', 'Users earn rewards'],
                ['Centralized ownership', 'Community-driven value'],
                ['Limited transparency', 'Blockchain-backed transparency'],
                ['High bot activity', 'AI-powered validation'],
                ['Poor contributor incentives', 'Reward-based participation'],
              ].map(([left, right], i) => (
                <>
                  <div key={`l${i}`} className="p-5 border-b border-r border-white/5 text-white/40 text-sm font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 shrink-0" />{left}
                  </div>
                  <div key={`r${i}`} className="p-5 border-b border-white/5 text-white/70 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-brand shrink-0" />{right}
                  </div>
                </>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── REWARD FLOW ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Economics</SectionLabel>
          <SectionTitle>Token & Rewards Model</SectionTitle>
          <div className="glass-card rounded-[40px] p-10 border border-white/10">
            <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-2xl">
              The NEXT ecosystem is designed around contribution-based rewards. Every verified action generates XPS that can be converted into on-chain token rewards during scheduled snapshot events.
            </p>
            <div className="flex flex-col items-center space-y-0 max-w-xs mx-auto">
              {['User Participation', 'Submission Verification', 'XPS Rewards', 'Snapshot Event', 'Token Conversion', 'Wallet Distribution'].map((step, i, arr) => (
                <div key={step} className="flex flex-col items-center w-full">
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-center font-black uppercase tracking-widest text-xs text-white/60">
                    {step}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-px h-4 bg-white/10" />
                      <ArrowDown size={14} className="text-white/20" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── USE CASES ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Applications</SectionLabel>
          <SectionTitle>Use Cases</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: BarChart3, title: 'Market Research', color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Businesses collect accurate consumer insights from verified participants.' },
              { icon: Brain, title: 'AI Training Data', color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'AI systems gain access to higher-quality human feedback datasets.' },
              { icon: Users, title: 'Community Governance', color: 'text-brand', bg: 'bg-brand/10', desc: 'Projects gather opinions and decisions from active contributors.' },
              { icon: Zap, title: 'Product Development', color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Organizations validate ideas directly with real users before launch.' },
            ].map(({ icon: Icon, title, color, bg, desc }) => (
              <div key={title} className="glass-card rounded-[32px] p-8 border border-white/10 space-y-4">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center`}>
                  <Icon size={26} className={color} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight italic">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── SECURITY ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Trust</SectionLabel>
          <SectionTitle>Security & Trust</SectionTitle>
          <div className="glass-card rounded-[40px] p-10 border border-white/10 relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand/5 blur-[80px] rounded-full pointer-events-none" />
            <p className="text-white/40 text-sm leading-relaxed max-w-2xl mb-8">
              NEXT is designed with multiple layers of security to maintain trust across the ecosystem while ensuring contributors receive fair recognition for their participation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['User verification systems', 'AI-powered fraud detection', 'Transparent reward tracking', 'Blockchain-based settlement', 'Immutable transaction records'].map(item => (
                <div key={item} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <Lock size={14} className="text-brand shrink-0" />
                  <span className="text-xs font-bold text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── ROADMAP ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <SectionLabel>Timeline</SectionLabel>
          <SectionTitle>Roadmap</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { phase: 'Phase 1', name: 'Foundation', color: 'border-brand/30 bg-brand/5', label: 'text-brand', items: ['Platform architecture development', 'Core dashboard deployment', 'Early user onboarding', 'Initial survey framework'] },
              { phase: 'Phase 2', name: 'Growth', color: 'border-blue-500/30 bg-blue-500/5', label: 'text-blue-400', items: ['Expanded task ecosystem', 'Advanced AI validation', 'Multi-region participation', 'Data quality optimization'] },
              { phase: 'Phase 3', name: 'Token Launch', color: 'border-purple-500/30 bg-purple-500/5', label: 'text-purple-400', items: ['Reward snapshots', 'Security audits', 'Token generation event', 'Blockchain reward distribution'] },
              { phase: 'Phase 4', name: 'Global Expansion', color: 'border-amber-500/30 bg-amber-500/5', label: 'text-amber-400', items: ['Enterprise integrations', 'Research partnerships', 'AI data marketplace', 'Ecosystem scaling'] },
            ].map(({ phase, name, color, label, items }) => (
              <div key={phase} className={`rounded-[32px] p-8 border ${color} space-y-4`}>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${label} mb-1`}>{phase}</p>
                  <h3 className="text-xl font-black uppercase tracking-tight italic">{name}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/50">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${label.replace('text-', 'bg-')}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── VISION ── */}
      <Section>
        <motion.div {...fadeUp(0.1)}>
          <div className="glass-card rounded-[40px] p-12 border border-brand/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
            <SectionLabel>Vision</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none mb-8 relative z-10">
              A Fairer<br /><span className="text-brand">Digital Economy</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl mx-auto relative z-10">
              We envision a future where every meaningful contribution has measurable value. NEXT Protocol is building a transparent ecosystem where human intelligence, verified feedback, and blockchain technology work together to create a fairer digital economy — one where contributors are rewarded, organizations gain trusted insights, and data ownership becomes more equitable for everyone.
            </p>
          </div>
        </motion.div>
      </Section>

    </div>
  );
}
