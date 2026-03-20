'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profileAPI, diagnosticAPI, pathwayAPI } from '@/lib/api'

const STEPS = ['Role', 'Profile', 'Diagnostic', 'Generating']

const PLATFORM_FIELDS = [
  { key: 'github_username', label: 'GitHub', placeholder: 'username', prefix: 'github.com/', color: '#63b3ed', desc: 'Repos, languages, projects' },
  { key: 'leetcode_username', label: 'LeetCode', placeholder: 'username', prefix: 'leetcode.com/u/', color: '#f6a623', desc: 'Solved count, topic tags' },
  { key: 'hackerrank_username', label: 'HackerRank', placeholder: 'username', prefix: 'hackerrank.com/', color: '#4dd9ac', desc: 'Badges, skill stars' },
  { key: 'htb_username', label: 'HackTheBox', placeholder: 'username', prefix: 'hackthebox.com/', color: '#a78bfa', desc: 'Rank, machine categories' },
  { key: 'tryhackme_username', label: 'TryHackMe', placeholder: 'username', prefix: 'tryhackme.com/p/', color: '#f85149', desc: 'Completed rooms, paths' },
]

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [roles, setRoles] = useState({})
  const [selectedRole, setSelectedRole] = useState('')
  const [profileData, setProfileData] = useState({
    github_username: '', leetcode_username: '', hackerrank_username: '',
    htb_username: '', tryhackme_username: '', resume_text: '', linkedin_text: '',
  })
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    pathwayAPI.getRoles().then(r => setRoles(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (step === 2 && selectedRole) {
      diagnosticAPI.getQuestions(selectedRole)
        .then(r => { setQuestions(r.data); setAnswers({}) })
        .catch(() => {})
    }
  }, [step, selectedRole])

  const handleGenerate = async () => {
    setStep(3)
    setError('')
    try {
      setStatusMsg('Extracting profile from connected platforms...')
      const profileRes = await profileAPI.extract({ ...profileData, target_role: selectedRole })
      const profile = profileRes.data

      let diagnosticSkills = []
      if (Object.keys(answers).length > 0) {
        setStatusMsg('Processing diagnostic quiz results...')
        const diagRes = await diagnosticAPI.submit({ target_role: selectedRole, answers })
        diagnosticSkills = diagRes.data.skills
      }

      setStatusMsg('Running adaptive pathing algorithm...')
      const pathRes = await pathwayAPI.generate({
        profile,
        target_role: selectedRole,
        diagnostic_skills: diagnosticSkills
      })

      sessionStorage.setItem('pathway', JSON.stringify(pathRes.data))
      sessionStorage.setItem('profile', JSON.stringify(profile))
      router.push('/pathway')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Something went wrong. Check your API key and try again.')
      setStep(2)
    }
  }

  const canProceedStep1 = Object.values(profileData).some(v => v.trim())

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="grid-bg" />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
          onClick={() => router.push('/')}>← PathPilot</span>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: i <= step ? 1 : 0.3 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i < step ? 'var(--accent-green)' : i === step ? 'var(--accent-blue)' : 'var(--bg-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: i <= step ? '#0d1117' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)', transition: 'all 0.3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600,
                  color: i === step ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 24, height: 1,
                  background: i < step ? 'var(--accent-green)' : 'var(--border)',
                  margin: '0 4px', transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 680 }}>

          {/* Step 0 - Role */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>What role are you targeting?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                This determines which skills we look for and what your pathway covers.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {Object.entries(roles).map(([key, label]) => (
                  <button key={key} onClick={() => setSelectedRole(key)} style={{
                    padding: '16px 20px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${selectedRole === key ? 'var(--accent-blue)' : 'var(--border)'}`,
                    background: selectedRole === key ? 'rgba(99,179,237,0.08)' : 'var(--bg-2)',
                    color: selectedRole === key ? 'var(--accent-blue)' : 'var(--text-primary)',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                    transition: 'all 0.15s',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" disabled={!selectedRole}
                  onClick={() => setStep(1)}>
                  Next: Add Profile Sources →
                </button>
              </div>
            </div>
          )}

          {/* Step 1 - Profile */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>Connect your profiles</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                Add any combination — the more sources, the more accurate your pathway.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32, fontFamily: 'var(--font-mono)' }}>
                All data is extracted in real-time. Nothing is stored.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PLATFORM_FIELDS.map(field => (
                  <div key={field.key} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: field.color }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{field.label}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{field.desc}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        padding: '10px 12px', background: 'var(--bg-0)',
                        border: '1px solid var(--border)', borderRight: 'none',
                        borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                        fontSize: 12, color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                      }}>{field.prefix}</span>
                      <input className="input"
                        style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
                        placeholder={field.placeholder}
                        value={profileData[field.key]}
                        onChange={e => setProfileData(p => ({ ...p, [field.key]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}

                <div className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b949e' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Resume / CV</span>
                    <span className="badge badge-blue" style={{ fontSize: 10 }}>paste text</span>
                  </div>
                  <textarea className="input" placeholder="Paste your resume text here..." rows={4}
                    value={profileData.resume_text}
                    onChange={e => setProfileData(p => ({ ...p, resume_text: e.target.value }))}
                  />
                </div>

                <div className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#63b3ed' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>LinkedIn</span>
                    <span className="badge badge-blue" style={{ fontSize: 10 }}>export PDF → paste text</span>
                  </div>
                  <textarea className="input" placeholder="Paste your LinkedIn profile text here..." rows={3}
                    value={profileData.linkedin_text}
                    onChange={e => setProfileData(p => ({ ...p, linkedin_text: e.target.value }))}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  marginTop: 16, padding: '12px 16px',
                  background: 'rgba(248,81,73,0.1)',
                  border: '1px solid rgba(248,81,73,0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-red)', fontSize: 13,
                }}>{error}</div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" disabled={!canProceedStep1}
                  onClick={() => setStep(2)}>
                  Next: Diagnostic Quiz →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 - Diagnostic */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>Quick diagnostic</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>
                Rate your confidence on each skill from 1 to 5.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 32 }}>
                1 = Never heard of it · 3 = I've used it · 5 = I could teach this
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {questions.map((q) => (
                  <div key={q.id} className="card" style={{ padding: '20px 24px' }}>
                    <span className="badge badge-purple" style={{ marginBottom: 8, display: 'inline-block' }}>{q.domain}</span>
                    <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{q.question}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      {q.anchor}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setAnswers(a => ({ ...a, [q.id]: n }))} style={{
                          flex: 1, padding: '8px 0',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${answers[q.id] === n ? 'var(--accent-blue)' : 'var(--border)'}`,
                          background: answers[q.id] === n ? 'rgba(99,179,237,0.12)' : 'var(--bg-3)',
                          color: answers[q.id] === n ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'var(--font-mono)',
                          fontWeight: 600, fontSize: 14, transition: 'all 0.1s',
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{
                  marginTop: 16, padding: '12px 16px',
                  background: 'rgba(248,81,73,0.1)',
                  border: '1px solid rgba(248,81,73,0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-red)', fontSize: 13,
                }}>{error}</div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={handleGenerate}>
                  Generate My Pathway →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Generating */}
          {step === 3 && (
            <div style={{ textAlign: 'center', paddingTop: 60 }} className="animate-fade-in">
              <div style={{
                width: 64, height: 64, margin: '0 auto 24px',
                border: '3px solid var(--bg-3)',
                borderTop: '3px solid var(--accent-blue)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <h2 style={{ fontSize: 28, marginBottom: 12 }}>Building your pathway</h2>
              <p style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {statusMsg || 'Initializing...'}
              </p>
              <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '48px auto 0', textAlign: 'left' }}>
                {[
                  'Extracting platform signals',
                  'Running LLM skill fusion',
                  'Computing skill gaps',
                  'Traversing prerequisite DAG',
                  'Writing reasoning trace',
                ].map((msg, i) => (
                  <div key={msg} style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    opacity: 0, animation: `fadeIn 0.4s ease ${i * 0.4}s forwards`,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}