'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import ThemeToggle from '@/components/ThemeToggle'

const DIFF_COLORS = { beginner: '#3fb950', intermediate: '#f6a623', advanced: '#f85149' }
const DIFF_BADGE = { beginner: 'badge-green', intermediate: 'badge-orange', advanced: 'badge-red' }
const SOURCE_COLORS = {
  github: '#63b3ed', leetcode: '#f6a623', hackthebox: '#a78bfa',
  tryhackme: '#f85149', hackerrank: '#4dd9ac', resume: '#8b949e',
  linkedin: '#63b3ed', quiz: '#4dd9ac',
}

function SkillBar({ name, score, source }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { setTimeout(() => setWidth(score * 100), 100) }, [score])
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{name}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge" style={{
            background: `${SOURCE_COLORS[source] || '#8b949e'}20`,
            color: SOURCE_COLORS[source] || '#8b949e',
            border: `1px solid ${SOURCE_COLORS[source] || '#8b949e'}40`,
            fontSize: 10,
          }}>{source}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
            {Math.round(score * 100)}%
          </span>
        </div>
      </div>
      <div className="skill-bar">
        <div className="skill-bar-fill" style={{
          width: `${width}%`,
          background: score >= 0.7 ? 'var(--accent-green)' : score >= 0.4 ? 'var(--accent-orange)' : 'var(--accent-red)',
        }} />
      </div>
    </div>
  )
}

function ModuleCard({ node, index }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card" style={{
      padding: '20px 24px', cursor: 'pointer',
      transition: 'border-color 0.2s',
      borderLeft: `3px solid ${DIFF_COLORS[node.module.difficulty]}`,
      animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,179,237,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', flexShrink: 0,
            }}>{index + 1}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>
              {node.module.title}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginLeft: 32 }}>
            {node.reason}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
          <span className={`badge ${DIFF_BADGE[node.module.difficulty]}`}>
            {node.module.difficulty}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            ~{node.estimated_completion_days}d
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s ease' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{node.module.description}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Teaches:</span>
            {node.module.skills_taught.map(s => (
              <span key={s} className="badge badge-blue" style={{ fontSize: 11 }}>{s}</span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {node.module.duration_hours}h estimated</span>
        </div>
      )}
    </div>
  )
}

export default function PathwayPage() {
  const router = useRouter()
  const [pathway, setPathway] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('pathway')

  useEffect(() => {
    const p = sessionStorage.getItem('pathway')
    const pr = sessionStorage.getItem('profile')
    if (!p) { router.push('/onboard'); return }
    setPathway(JSON.parse(p))
    setProfile(JSON.parse(pr))
  }, [router])

  if (!pathway) return null

  const radarData = (profile?.skills || []).slice(0, 8).map(s => ({
    subject: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
    score: Math.round(s.score * 100),
    fullMark: 100,
  }))

  const gapData = (pathway.skill_gaps || []).slice(0, 8).map(g => ({
    name: g.skill?.length > 10 ? g.skill.slice(0, 10) + '…' : g.skill,
    current: Math.round((g.current || 0) * 100),
    required: Math.round((g.required || 0) * 100),
  }))

  const TABS = ['pathway', 'skills', 'gaps', 'trace']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      <div className="grid-bg" />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(8,11,16,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            onClick={() => router.push('/')}>PathPilot</span>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {profile?.name || 'Your'} · {pathway.target_role.replace(/_/g, ' ')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--accent-blue)' }}>
              {pathway.total_modules}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>modules</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--accent-cyan)' }}>
              {pathway.estimated_days}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>est. days</div>
          </div>
            <ThemeToggle />
            <button className="btn btn-ghost" onClick={() => router.push('/onboard')}>↩ Start Over</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', gap: 2, padding: '0 40px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-1)',
      }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '14px 20px', border: 'none', background: 'transparent',
            color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer',
            borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-blue)' : 'transparent'}`,
            transition: 'all 0.15s', textTransform: 'capitalize',
          }}>{tab === 'trace' ? 'Reasoning Trace' : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

        {/* Pathway tab */}
        {activeTab === 'pathway' && (
          <div className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontSize: 24 }}>Your learning pathway</h2>
              <span className="badge badge-blue">{pathway.total_modules} modules · {pathway.estimated_days} days</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pathway.nodes.map((node, i) => (
                <ModuleCard key={node.module.id} node={node} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Skills tab */}
        {activeTab === 'skills' && (
          <div className="animate-fade-up">
            <h2 style={{ fontSize: 24, marginBottom: 24 }}>Detected skill profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 20, color: 'var(--text-secondary)' }}>Skill levels</h3>
                {(profile?.skills || []).map(s => (
                  <SkillBar key={s.name} name={s.name} score={s.score} source={s.source} />
                ))}
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 20, color: 'var(--text-secondary)' }}>Radar view</h3>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b949e', fontSize: 11 }} />
                      <Radar dataKey="score" stroke="#63b3ed" fill="#63b3ed" fillOpacity={0.15} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 80 }}>No skill data</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gaps tab */}
        {activeTab === 'gaps' && (
          <div className="animate-fade-up">
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Skill gap analysis</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Your current skill levels vs what the role requires.
            </p>
            {gapData.length > 0 ? (
              <div className="card" style={{ padding: 24 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={gapData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8b949e', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#8b949e', fontSize: 12 }} width={80} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(val, name) => [`${val}%`, name]}
                    />
                    <Bar dataKey="current" name="Current" fill="#3fb950" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="required" name="Required" fill="rgba(99,179,237,0.25)" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#3fb950' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current level</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(99,179,237,0.4)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Required level</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No gap data available
              </div>
            )}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(pathway.skill_gaps || []).map(g => (
                <div key={g.skill} className="card" style={{
                  padding: '14px 20px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{g.skill}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {Math.round((g.current || 0) * 100)}% → {Math.round((g.required || 0) * 100)}%
                    </span>
                    <div style={{
                      padding: '3px 10px', borderRadius: 99,
                      background: 'rgba(248,81,73,0.1)',
                      border: '1px solid rgba(248,81,73,0.3)',
                      fontSize: 11, fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-red)',
                    }}>-{Math.round((g.gap || 0) * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trace tab */}
        {activeTab === 'trace' && (
          <div className="animate-fade-up">
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Reasoning trace</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Full transparency into how your pathway was generated.
            </p>
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, color: 'var(--accent-blue)' }}>
                Pathway curation strategy
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {pathway.reasoning_trace || 'No reasoning trace available.'}
              </p>
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-secondary)' }}>Per-module reasoning</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pathway.nodes.map((node) => (
                <div key={node.module.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
                      background: 'var(--bg-3)', padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                    }}>{node.module.id}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                        {node.module.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {node.reason}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}