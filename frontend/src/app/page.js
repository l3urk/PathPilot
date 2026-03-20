'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { pathwayAPI } from '@/lib/api'

const ROLES_PREVIEW = [
  'Backend Engineer', 'Penetration Tester', 'Data Scientist',
  'ML Engineer', 'DevOps Engineer', 'Frontend Engineer',
]

const FEATURES = [
  { icon: '⬡', title: 'GitHub Intelligence', desc: 'Analyzes repos, languages, and project domains from your public GitHub.' },
  { icon: '◈', title: 'LeetCode Signal', desc: 'Reads solved count, difficulty breakdown, and topic tag distribution.' },
  { icon: '◎', title: 'Security Profiles', desc: 'Parses HackTheBox rank, TryHackMe paths, and HackerRank certifications.' },
  { icon: '⬟', title: 'Adaptive DAG', desc: 'Graph-based prerequisite engine skips what you know, prioritizes what matters.' },
  { icon: '◇', title: 'Reasoning Trace', desc: 'Every recommendation comes with a full explanation.' },
  { icon: '⬢', title: 'Role-Specific Grounding', desc: 'Pathways grounded in O*NET competency standards, zero hallucination.' },
]

export default function Home() {
  const router = useRouter()
  const [roleIdx, setRoleIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setRoleIdx(i => (i + 1) % ROLES_PREVIEW.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" />

      {/* Glow orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '30%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(99,179,237,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid var(--border)',
        background: 'rgba(8,11,16,0.8)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--accent-blue)',
            borderRadius: 6, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 14, fontWeight: 800,
            color: '#0d1117', fontFamily: 'var(--font-display)',
          }}>P</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>PathPilot</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span className="badge badge-blue">AI Onboarding Engine</span>
          <button className="btn btn-ghost" onClick={() => router.push('/onboard')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: '100px 32px 80px', textAlign: 'center',
      }}>
        <div className="badge badge-cyan" style={{ marginBottom: 24, fontSize: 12 }}>
          AI-Adaptive Onboarding Engine
        </div>

        <h1 style={{ fontSize: 'clamp(42px, 6vw, 72px)', marginBottom: 16, letterSpacing: '-0.02em' }}>
          Your path to becoming a<br />
          <span style={{
            background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'inline-block', minWidth: 400,
          }}>
            {ROLES_PREVIEW[roleIdx]}
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-secondary)',
          maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7,
        }}>
          Stop wasting time on training you don't need. PathPilot analyzes your GitHub,
          LeetCode, HackTheBox and more — then builds a laser-focused learning pathway
          grounded in real skill evidence.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/onboard')}>
            Build My Pathway →
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 40, justifyContent: 'center',
          marginTop: 64, paddingTop: 40,
          borderTop: '1px solid var(--border)', flexWrap: 'wrap',
        }}>
          {[['6+','Profile Sources'],['30+','Course Modules'],['9','Job Roles'],['0','Hallucinations']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{val}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px',
      }}>
        <h2 style={{
          textAlign: 'center', fontSize: 32, marginBottom: 48,
          color: 'var(--text-secondary)', fontWeight: 600,
        }}>
          How PathPilot knows what you know
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ padding: 24, transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,179,237,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 22, marginBottom: 12, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', padding: '60px 32px 100px',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 40, marginBottom: 16 }}>Ready to skip ahead?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
          Takes 2 minutes. No signup required.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => router.push('/onboard')}>
          Start Profiling →
        </button>
      </section>
    </div>
  )
}