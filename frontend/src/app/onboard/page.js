'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profileAPI, pathwayAPI } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000/api' })

const STEPS_A = ['Role', 'Choose Path', 'Resume & Links', 'Skill Summary', 'Pathway']
const STEPS_B = ['Role', 'Choose Path', 'Know What?', 'How Well?', 'Pathway']

const ALL_PLATFORM_FIELDS = [
  { key: 'github_username', label: 'GitHub', placeholder: 'username or https://github.com/username', prefix: 'github.com/', color: '#63b3ed', desc: 'Repos, languages, projects', roles: 'all',
    extract: (v) => { const m = v.match(/github\.com\/([a-zA-Z0-9-]{1,39})\/?$/); return m ? m[1] : /^[a-zA-Z0-9-]{1,39}$/.test(v) ? v : null },
    verify: async (u) => { try { const r = await fetch(`https://api.github.com/users/${u}`); return r.status === 200 ? null : 'User not found' } catch { return null } }
  },
  { key: 'leetcode_username', label: 'LeetCode', placeholder: 'username or https://leetcode.com/u/username', prefix: 'leetcode.com/u/', color: '#f6a623', desc: 'Solved count, topic tags', roles: 'all',
    extract: (v) => { const m = v.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]{3,25})\/?$/); return m ? m[1] : /^[a-zA-Z0-9_-]{3,25}$/.test(v) ? v : null },
    verify: async (u) => { try { const r = await fetch('https://leetcode.com/graphql', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({query:`{matchedUser(username:"${u}"){username}}`})}); const d = await r.json(); return d?.data?.matchedUser ? null : 'User not found' } catch { return null } }
  },
  { key: 'hackerrank_username', label: 'HackerRank', placeholder: 'username or https://hackerrank.com/username', prefix: 'hackerrank.com/', color: '#4dd9ac', desc: 'Badges, skill stars', roles: 'all',
    extract: (v) => { const m = v.match(/hackerrank\.com\/([a-zA-Z0-9_-]{3,30})\/?$/); return m ? m[1] : /^[a-zA-Z0-9_-]{3,30}$/.test(v) ? v : null },
    verify: async () => null
  },
  { key: 'htb_username', label: 'HackTheBox', placeholder: 'username or https://hackthebox.com/profile/username', prefix: 'hackthebox.com/', color: '#a78bfa', desc: 'Rank, machine categories', roles: ['cybersecurity_analyst','penetration_tester'],
    extract: (v) => { const m = v.match(/hackthebox\.com\/(?:profile\/)?([a-zA-Z0-9_-]{3,30})\/?$/); return m ? m[1] : /^[a-zA-Z0-9_-]{3,30}$/.test(v) ? v : null },
    verify: async () => null
  },
  { key: 'tryhackme_username', label: 'TryHackMe', placeholder: 'username or https://tryhackme.com/p/username', prefix: 'tryhackme.com/p/', color: '#f85149', desc: 'Completed rooms, paths', roles: ['cybersecurity_analyst','penetration_tester'],
    extract: (v) => { const m = v.match(/tryhackme\.com\/p\/([a-zA-Z0-9_-]{3,30})\/?$/); return m ? m[1] : /^[a-zA-Z0-9_-]{3,30}$/.test(v) ? v : null },
    verify: async (u) => { try { const r = await fetch(`https://tryhackme.com/api/user/rank/${u}`); return r.status === 200 ? null : 'User not found' } catch { return null } }
  },
]

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [roles, setRoles] = useState({})
  const [selectedRole, setSelectedRole] = useState('')
  const [path, setPath] = useState(null) // 'A' or 'B'

  // Path A state
  const [profileData, setProfileData] = useState({ github_username:'', leetcode_username:'', hackerrank_username:'', htb_username:'', tryhackme_username:'', resume_text:'', linkedin_text:'' })
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [fieldStatus, setFieldStatus] = useState({})
  const [extractedProfile, setExtractedProfile] = useState(null)
  const [scraping, setScraping] = useState(false)
  const [scrapeMsg, setScrapeMsg] = useState('')

  // Path B state
  const [skillCategories, setSkillCategories] = useState({})
  const [selectedSkills, setSelectedSkills] = useState([])
  const [techniqueQuestions, setTechniqueQuestions] = useState([])
  const [techAnswers, setTechAnswers] = useState({})
  const [diagGaps, setDiagGaps] = useState(null)

  // Shared
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    pathwayAPI.getRoles().then(r => setRoles(r.data)).catch(() => {})
  }, [])

  const visibleFields = ALL_PLATFORM_FIELDS.filter(f => f.roles === 'all' || f.roles.includes(selectedRole))

  const handleFieldChange = (key, value) => {
    setProfileData(p => ({ ...p, [key]: value }))
    if (fieldErrors[key]) {
      setFieldErrors(e => ({ ...e, [key]: null }))
      setFieldStatus(s => ({ ...s, [key]: null }))
    }
  }

  const handleFieldBlur = async (key, value) => {
    if (!value.trim()) {
      setFieldErrors(e => ({ ...e, [key]: null }))
      setFieldStatus(s => ({ ...s, [key]: null }))
      return
    }
    const field = ALL_PLATFORM_FIELDS.find(f => f.key === key)
    if (!field) return
    const username = field.extract(value.trim())
    if (!username) {
      setFieldErrors(e => ({ ...e, [key]: 'Invalid format — enter username or full profile URL' }))
      setFieldStatus(s => ({ ...s, [key]: 'error' }))
      return
    }
    setFieldStatus(s => ({ ...s, [key]: 'verifying' }))
    setFieldErrors(e => ({ ...e, [key]: null }))
    const err = await field.verify(username)
    if (err) {
      setFieldErrors(e => ({ ...e, [key]: err }))
      setFieldStatus(s => ({ ...s, [key]: 'error' }))
    } else {
      setFieldStatus(s => ({ ...s, [key]: 'valid' }))
      setProfileData(p => ({ ...p, [key]: username }))
    }
  }

  const handleResumeFile = async (file) => {
    if (!file) return
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg']
    if (!allowed.includes(file.type)) { setResumeError('Only PDF, Word, PNG, JPG accepted'); setResumeFile(null); return }
    if (file.size > 10 * 1024 * 1024) { setResumeError('File must be under 10MB'); setResumeFile(null); return }
    setResumeError('')
    setResumeFile(file)
    setResumeError('Extracting text from resume...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('http://localhost:8000/api/resume/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfileData(p => ({ ...p, resume_text: res.data.text }))
      setResumeError('')
    } catch (e) {
      setResumeError('Failed to extract text from resume. Please try a different file.')
      setResumeFile(null)
    }
  }

  // Path A: Scrape and check if enough data
const handleScrape = async () => {
    setScraping(true); setError('')
    try {
      setScrapeMsg('Extracting data from your profiles...')
      const res = await profileAPI.extract({ ...profileData, target_role: selectedRole })
      const profile = res.data
      setScrapeMsg('Generating your personalized pathway...')
      const pathRes = await pathwayAPI.generate({
        profile,
        target_role: selectedRole,
        diagnostic_skills: []
      })
      sessionStorage.setItem('pathway', JSON.stringify(pathRes.data))
      sessionStorage.setItem('profile', JSON.stringify(profile))
      setScraping(false)
      router.push('/pathway')
    } catch (e) {
      setScraping(false)
      setError('Failed to extract profile data. Please check your inputs and try again.')
    }
  }

  // Path A: Generate from extracted profile
  const handleGenerateFromProfile = async () => {
    setGenerating(true); setGenMsg('Running adaptive pathing algorithm...')
    try {
      const res = await pathwayAPI.generate({ profile: extractedProfile, target_role: selectedRole, diagnostic_skills: [] })
      sessionStorage.setItem('pathway', JSON.stringify(res.data))
      sessionStorage.setItem('profile', JSON.stringify(extractedProfile))
      router.push('/pathway')
    } catch (e) {
      setError('Failed to generate pathway. Please try again.')
      setGenerating(false)
    }
  }

  // Path B Stage 1: Load skill categories
  const handlePathB = async () => {
    setPath('B'); setStep(2)
    try {
      const res = await api.get(`/diagnostic/stage1/${selectedRole}`)
      setSkillCategories(res.data.skill_categories || {})
    } catch { setSkillCategories({}) }
  }

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  // Path B Stage 2: Load technique questions
const handleStage2 = async () => {
  setError('')

  // If no skills selected — candidate is a beginner
  // Skip technique questions and go straight to pathway with zero scores
  if (selectedSkills.length === 0) {
    setGenerating(true)
    setGenMsg('Building a beginner pathway for you...')
    try {
      const beginnerProfile = {
        user_id: `diag-${Date.now()}`,
        name: null,
        skills: [],
        raw_sources: { quiz: { selected_skills: [] } }
      }
      const pathRes = await pathwayAPI.generate({
        profile: beginnerProfile,
        target_role: selectedRole,
        diagnostic_skills: []
      })
      sessionStorage.setItem('pathway', JSON.stringify(pathRes.data))
      sessionStorage.setItem('profile', JSON.stringify(beginnerProfile))
      setGenerating(false)
      router.push('/pathway')
    } catch {
      setError('Failed to generate pathway. Please try again.')
      setGenerating(false)
    }
    return
  }

  try {
    const res = await api.post('/diagnostic/stage2', { target_role: selectedRole, selected_skills: selectedSkills })
    setTechniqueQuestions(res.data.skill_questions || [])
    setStep(3)
  } catch { setError('Failed to load questions. Please try again.') }
}

  // Path B: Submit diagnostic and show gaps
  const handleSubmitDiagnostic = async () => {
    setGenerating(true); setGenMsg('Analyzing your skill gaps...')
    try {
      const gapRes = await api.post('/diagnostic/gaps', {
        target_role: selectedRole,
        selected_skills: selectedSkills,
        technique_answers: techAnswers
      })
      setDiagGaps(gapRes.data)

      setGenMsg('Generating your personalized pathway...')
      const diagSkills = gapRes.data.skills

      // Build a minimal profile from diagnostic
      const minimalProfile = {
        user_id: `diag-${Date.now()}`,
        name: null,
        skills: diagSkills,
        raw_sources: { quiz: { selected_skills: selectedSkills } }
      }

      const pathRes = await pathwayAPI.generate({
        profile: minimalProfile,
        target_role: selectedRole,
        diagnostic_skills: diagSkills
      })

      sessionStorage.setItem('pathway', JSON.stringify(pathRes.data))
      sessionStorage.setItem('profile', JSON.stringify(minimalProfile))
      sessionStorage.setItem('diagGaps', JSON.stringify(gapRes.data))
      setGenerating(false)
      router.push('/pathway')
    } catch (e) {
      setError('Failed to generate pathway. Please try again.')
      setGenerating(false)
    }
  }

  const hasBlockingErrors = Object.values(fieldErrors).some(v => v !== null)
  const isVerifying = Object.values(fieldStatus).some(s => s === 'verifying')
  const canScrape = resumeFile !== null && !resumeError && !hasBlockingErrors && !isVerifying

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="grid-bg" />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={() => router.push('/')}>← PathPilot</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(path === 'B' ? STEPS_B : STEPS_A).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: i <= step ? 1 : 0.3 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < step ? 'var(--accent-green)' : i === step ? 'var(--accent-blue)' : 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i <= step ? '#0d1117' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
                </div>
                {i < STEPS_A.length - 1 && <div style={{ width: 20, height: 1, background: i < step ? 'var(--accent-green)' : 'var(--border)', margin: '0 4px' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>

          {/* ── STEP 0: Role Selection ── */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>What role are you targeting?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>This determines which skills we look for and what your pathway covers.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {Object.entries(roles).map(([key, label]) => (
                  <button key={key} onClick={() => setSelectedRole(key)} style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', border: `1px solid ${selectedRole === key ? 'var(--accent-blue)' : 'var(--border)'}`, background: selectedRole === key ? 'rgba(99,179,237,0.08)' : 'var(--bg-2)', color: selectedRole === key ? 'var(--accent-blue)' : 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, transition: 'all 0.15s' }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" disabled={!selectedRole} onClick={() => setStep(1)}>Next: Choose Your Path →</button>
              </div>
            </div>
          )}

          {/* ── STEP 1: Choose Path ── */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>How do you want to proceed?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Choose the path that works best for you.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Path A */}
                <button onClick={() => { setPath('A'); setStep(2) }} style={{ padding: '28px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--bg-2)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.background = 'rgba(99,179,237,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-2)' }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>Upload Resume & Links</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Upload your CV and connect GitHub, LeetCode, HackTheBox and more. We'll extract your skills automatically.</div>
                  <div style={{ marginTop: 16, fontSize: 12, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>→ Best if you have an online presence</div>
                </button>

                {/* Path B */}
                <button onClick={handlePathB} style={{ padding: '28px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--bg-2)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.background = 'rgba(77,217,172,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-2)' }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🧠</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>Take Diagnostic Test</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Tell us what you know, then we'll ask targeted questions. We'll identify your exact gaps and build your pathway.</div>
                  <div style={{ marginTop: 16, fontSize: 12, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>→ Best for precise skill assessment</div>
                </button>

              </div>
              <div style={{ marginTop: 24 }}>
                <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
              </div>
            </div>
          )}

          {/* ── PATH A STEP 2: Resume & Links ── */}
          {step === 2 && path === 'A' && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>Upload your resume & connect profiles</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Resume is required. Platform links are optional but improve accuracy.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Resume */}
                <div className="card" style={{ padding: '16px 20px', border: `1px solid ${resumeFile ? 'var(--accent-green)' : 'rgba(248,81,73,0.4)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: resumeFile ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Resume / CV</span>
                    <span className="badge badge-red" style={{ fontSize: 10 }}>required</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>PDF, Word, PNG, JPG</span>
                  </div>
                  <div onClick={() => document.getElementById('resume-input').click()} style={{ border: `2px dashed ${resumeFile ? 'var(--accent-green)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: resumeFile ? 'rgba(63,185,80,0.05)' : 'var(--bg-3)', transition: 'all 0.2s' }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleResumeFile(e.dataTransfer.files[0]) }}>
                    <input id="resume-input" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => handleResumeFile(e.target.files[0])} />
                    {resumeFile ? (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>✓</div>
                        <div style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 600 }}>{resumeFile.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{(resumeFile.size / 1024).toFixed(1)} KB · Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 24, marginBottom: 8, color: 'var(--text-muted)' }}>↑</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Click to upload or drag and drop</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PDF, Word, PNG, JPG — max 10MB</div>
                      </div>
                    )}
                  </div>
                  {resumeError && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-red)' }}>{resumeError}</div>}
                </div>

                {/* Platform fields */}
                {visibleFields.map(field => (
                  <div key={field.key} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: field.color }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{field.label}</span>
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>optional</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{field.desc}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ padding: '10px 12px', background: 'var(--bg-0)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{field.prefix}</span>
                      <input className="input" style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', borderColor: fieldErrors[field.key] ? 'var(--accent-red)' : fieldStatus[field.key] === 'valid' ? 'var(--accent-green)' : undefined }}
                        placeholder={field.placeholder} value={profileData[field.key]}
                       onChange={e => handleFieldChange(field.key, e.target.value)}
                       onBlur={e => handleFieldBlur(field.key, e.target.value)} />
                      <div style={{ marginLeft: 8, width: 20, textAlign: 'center', fontSize: 14 }}>
                        {fieldStatus[field.key] === 'verifying' && <div style={{ width: 14, height: 14, border: '2px solid var(--bg-3)', borderTop: '2px solid var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
                        {fieldStatus[field.key] === 'valid' && <span style={{ color: 'var(--accent-green)' }}>✓</span>}
                        {fieldStatus[field.key] === 'error' && <span style={{ color: 'var(--accent-red)' }}>✕</span>}
                      </div>
                    </div>
                    {fieldErrors[field.key] && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--accent-red)' }}>✕ {fieldErrors[field.key]}</div>}
                  </div>
                ))}

                
              </div>

              {error && <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: 13 }}>{error}</div>}

              {scraping && (
                <div style={{ marginTop: 16, padding: '16px', background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid var(--bg-3)', borderTop: '2px solid var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{scrapeMsg}</span>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" disabled={!canScrape || scraping} onClick={handleScrape}>
                 {scraping ? scrapeMsg || 'Processing...' : 'Build My Pathway →'}
                </button>
              </div>
            </div>
          )}

          {/* ── PATH A STEP 3: Skill Summary ── */}
          {step === 3 && path === 'A' && extractedProfile && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>Here's what we found</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                We detected <strong>{extractedProfile.skills?.length || 0} skills</strong> from your profile. Review them below, then generate your pathway.
              </p>

              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                {(extractedProfile.skills || []).map(skill => {
                  const [width, setWidth] = useState(0)
                  useEffect(() => { setTimeout(() => setWidth(skill.score * 100), 100) }, [])
                  return (
                    <div key={skill.name} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'capitalize' }}>{skill.name}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="badge" style={{ background: 'rgba(99,179,237,0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(99,179,237,0.2)', fontSize: 10 }}>{skill.source}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{Math.round(skill.score * 100)}%</span>
                        </div>
                      </div>
                      <div className="skill-bar">
                        <div className="skill-bar-fill" style={{ width: `${width}%`, background: skill.score >= 0.7 ? 'var(--accent-green)' : skill.score >= 0.4 ? 'var(--accent-orange)' : 'var(--accent-red)' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{skill.evidence}</div>
                    </div>
                  )
                })}
              </div>

              {error && <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: 13 }}>{error}</div>}

              {generating && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 32, height: 32, margin: '0 auto 12px', border: '3px solid var(--bg-3)', borderTop: '3px solid var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{genMsg}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary btn-lg" disabled={generating} onClick={handleGenerateFromProfile}>
                  {generating ? 'Generating...' : 'Generate My Pathway →'}
                </button>
              </div>
            </div>
          )}

          {/* ── PATH B STEP 2: What do you know? ── */}
          {step === 2 && path === 'B' && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>What do you already know?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Select everything you have experience with. Be honest — this shapes your pathway.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 32 }}>Select all that apply — you can choose multiple</p>

              {Object.entries(skillCategories).map(([category, skills]) => (
                <div key={category} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>{category}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
  {skills.map(skill => (
    <button key={skill} onClick={() => toggleSkill(skill)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${selectedSkills.includes(skill) ? 'var(--accent-blue)' : 'var(--border)'}`, background: selectedSkills.includes(skill) ? 'rgba(99,179,237,0.12)' : 'var(--bg-2)', color: selectedSkills.includes(skill) ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 500, transition: 'all 0.15s' }}>
      {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
    </button>
  ))}

</div>
                </div>
              ))}

              {selectedSkills.length > 0 && (
                <div style={{ padding: '12px 16px', background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>Selected: {selectedSkills.join(', ')}</span>
                </div>
              )}

              {error && <div style={{ padding: '12px 16px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
               <button className="btn btn-primary" onClick={handleStage2} disabled={generating}>
  {generating ? 'Building pathway...' : selectedSkills.length === 0 ? 'I know none — build beginner pathway →' : 'Next: Technique Questions →'}
</button>
              </div>
            </div>
          )}

          {/* ── PATH B STEP 3: Technique Questions ── */}
          {step === 3 && path === 'B' && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, marginBottom: 8 }}>How well do you know them?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>For each skill you selected, answer whether you know these specific techniques.</p>

              {techniqueQuestions.map(({ skill, questions }) => (
                <div key={skill} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{skill}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {questions.map(q => (
                      <div key={q.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>{q.question}</p>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => setTechAnswers(a => ({ ...a, [q.id]: true }))} style={{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: `1px solid ${techAnswers[q.id] === true ? 'var(--accent-green)' : 'var(--border)'}`, background: techAnswers[q.id] === true ? 'rgba(63,185,80,0.12)' : 'var(--bg-3)', color: techAnswers[q.id] === true ? 'var(--accent-green)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.1s' }}>
                            Yes
                          </button>
                          <button onClick={() => setTechAnswers(a => ({ ...a, [q.id]: false }))} style={{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: `1px solid ${techAnswers[q.id] === false ? 'var(--accent-red)' : 'var(--border)'}`, background: techAnswers[q.id] === false ? 'rgba(248,81,73,0.12)' : 'var(--bg-3)', color: techAnswers[q.id] === false ? 'var(--accent-red)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.1s' }}>
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {error && <div style={{ padding: '12px 16px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

              {generating && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 32, height: 32, margin: '0 auto 12px', border: '3px solid var(--bg-3)', borderTop: '3px solid var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{genMsg}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary btn-lg" disabled={generating} onClick={handleSubmitDiagnostic}>
                  {generating ? 'Analyzing...' : 'Show My Gaps & Generate Pathway →'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}