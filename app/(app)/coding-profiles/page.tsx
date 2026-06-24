"use client"

import { useEffect, useState } from 'react'
import { getUserMe, updateCodingProfiles } from '@/lib/api'
import { GitBranch, Briefcase, Code2, ExternalLink, Copy, Check, Save, Loader2, Plus, Trash2, Link2 } from 'lucide-react'

interface CustomLink { label: string; url: string }

interface CodingProfiles {
  github: string
  linkedin: string
  leetcode: string
  codeforces: string
  hackerrank: string
  custom: CustomLink[]
}

interface GithubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  html_url: string
}

const PLATFORMS = [
  {
    key: 'github' as const,
    label: 'GitHub',
    placeholder: 'https://github.com/username',
    color: '#e5e7eb',
    icon: GitBranch,
    base: 'https://github.com/',
  },
  {
    key: 'linkedin' as const,
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
    color: '#0a66c2',
    icon: Briefcase,
    base: 'https://linkedin.com/in/',
  },
  {
    key: 'leetcode' as const,
    label: 'LeetCode',
    placeholder: 'https://leetcode.com/username',
    color: '#ffa116',
    icon: Code2,
    base: 'https://leetcode.com/',
  },
  {
    key: 'codeforces' as const,
    label: 'Codeforces',
    placeholder: 'https://codeforces.com/profile/username',
    color: '#1199bb',
    icon: Code2,
    base: 'https://codeforces.com/profile/',
  },
  {
    key: 'hackerrank' as const,
    label: 'HackerRank',
    placeholder: 'https://hackerrank.com/username',
    color: '#2ec866',
    icon: Code2,
    base: 'https://www.hackerrank.com/',
  },
]

function extractUsername(url: string, base: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('http')) {
    try {
      const u = new URL(trimmed)
      return u.pathname.replace(/^\//, '').split('/')[0] ?? ''
    } catch { return '' }
  }
  return trimmed
}

export default function CodingProfilesPage() {
  const [profiles, setProfiles] = useState<CodingProfiles>({
    github: '', linkedin: '', leetcode: '', codeforces: '', hackerrank: '', custom: [],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [githubUser, setGithubUser] = useState<GithubUser | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)

  useEffect(() => {
    getUserMe().then((u: any) => {
      if (u?.codingProfiles) {
        const cp = u.codingProfiles
        setProfiles(prev => ({ ...prev, ...cp, custom: Array.isArray(cp.custom) ? cp.custom : [] }))
      }
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addCustom = () =>
    setProfiles(p => ({ ...p, custom: [...p.custom, { label: '', url: '' }] }))
  const updateCustom = (i: number, field: keyof CustomLink, value: string) =>
    setProfiles(p => ({ ...p, custom: p.custom.map((c, idx) => idx === i ? { ...c, [field]: value } : c) }))
  const removeCustom = (i: number) =>
    setProfiles(p => ({ ...p, custom: p.custom.filter((_, idx) => idx !== i) }))

  // Fetch GitHub preview whenever the github field changes
  useEffect(() => {
    const username = extractUsername(profiles.github, 'https://github.com/')
    if (!username) { setGithubUser(null); return }
    const t = setTimeout(() => {
      setGithubLoading(true)
      fetch(`https://api.github.com/users/${username}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { setGithubUser(data); setGithubLoading(false) })
        .catch(() => { setGithubUser(null); setGithubLoading(false) })
    }, 800)
    return () => clearTimeout(t)
  }, [profiles.github])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Drop empty custom rows (both fields blank) before saving.
      const cleaned = {
        ...profiles,
        custom: profiles.custom
          .map(c => ({ label: c.label.trim(), url: c.url.trim() }))
          .filter(c => c.label || c.url),
      }
      await updateCodingProfiles(cleaned)
      setProfiles(p => ({ ...p, custom: cleaned.custom }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const copyLink = (url: string) => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="label-upper">Developer</p>
        <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
          CODING <span className="text-[#00e5ff]">PROFILES</span>
        </h1>
        <p className="mt-1 text-xs text-[#6b7280]">Store your developer links — copy them anywhere in one tap</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Links form */}
        <div className="lg:col-span-2 synapto-card p-5 space-y-4">
          <p className="label-upper mb-1">Your Profiles</p>

          {PLATFORMS.map(({ key, label, placeholder, color, icon: Icon, base }) => {
            const val = profiles[key]
            const hasLink = val.trim().length > 0
            return (
              <div key={key}>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color }}>
                  <Icon size={10} className="inline mr-1" />
                  {label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={val}
                    onChange={e => setProfiles(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
                  />
                  {hasLink && (
                    <>
                      <button
                        onClick={() => copyLink(val)}
                        title="Copy link"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-[#6b7280] hover:text-white transition-colors"
                      >
                        {copied === val ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                      </button>
                      <a
                        href={val.startsWith('http') ? val : `${base}${val}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open profile"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-[#6b7280] hover:text-white transition-colors"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {/* Custom links — add any link you want */}
          <div className="pt-3 border-t border-white/[0.07]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase tracking-widest text-[#a855f7]">
                <Link2 size={10} className="inline mr-1" />
                Custom Links
              </label>
              <button
                onClick={addCustom}
                className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#00e5ff] hover:opacity-80 transition-opacity"
              >
                <Plus size={11} /> Add link
              </button>
            </div>

            {profiles.custom.length === 0 && (
              <p className="text-xs text-[#6b7280]">Add any link — portfolio, blog, Twitter/X, Medium, anything.</p>
            )}

            <div className="space-y-2">
              {profiles.custom.map((c, i) => {
                const hasLink = c.url.trim().length > 0
                return (
                  <div key={i} className="rounded-lg border border-white/[0.07] p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-[#6b7280]">Link {i + 1}</span>
                      <button
                        onClick={() => removeCustom(i)}
                        title="Remove link"
                        className="flex h-6 w-6 items-center justify-center rounded text-[#6b7280] hover:text-[#ef4444] transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      value={c.label}
                      onChange={e => updateCustom(i, 'label', e.target.value)}
                      placeholder="Title (e.g. Portfolio, Twitter, Blog)"
                      className="w-full rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={c.url}
                        onChange={e => updateCustom(i, 'url', e.target.value)}
                        placeholder="https://…"
                        className="flex-1 min-w-0 rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-3 py-2 text-xs text-white placeholder:text-[#6b7280] outline-none focus:border-[#00e5ff]/40"
                      />
                      {hasLink && (
                        <>
                          <button
                            onClick={() => copyLink(c.url)}
                            title="Copy link"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] text-[#6b7280] hover:text-white transition-colors"
                          >
                            {copied === c.url ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                          </button>
                          <a
                            href={c.url.startsWith('http') ? c.url : `https://${c.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open link"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] text-[#6b7280] hover:text-white transition-colors"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 flex items-center gap-2 rounded-lg bg-[#00e5ff] px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profiles'}
          </button>
          {saved && <p className="text-xs text-[#22c55e]">Profiles saved successfully</p>}
        </div>

        {/* GitHub preview */}
        <div className="space-y-4">
          <div className="synapto-card p-4">
            <p className="label-upper mb-3">GitHub Preview</p>
            {githubLoading && (
              <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                <Loader2 size={12} className="animate-spin" />
                Fetching…
              </div>
            )}
            {!githubLoading && githubUser && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={githubUser.avatar_url} alt="avatar" className="h-12 w-12 rounded-full border border-white/10" />
                  <div>
                    <p className="text-sm font-bold text-white">{githubUser.name || githubUser.login}</p>
                    <p className="text-[10px] text-[#6b7280]">@{githubUser.login}</p>
                  </div>
                </div>
                {githubUser.bio && (
                  <p className="text-[11px] text-[#6b7280]">{githubUser.bio}</p>
                )}
                <div className="flex gap-4">
                  {[
                    { label: 'Repos',     value: githubUser.public_repos },
                    { label: 'Followers', value: githubUser.followers },
                    { label: 'Following', value: githubUser.following },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-sm font-black text-[#00e5ff]">{value}</p>
                      <p className="text-[9px] uppercase tracking-widest text-[#6b7280]">{label}</p>
                    </div>
                  ))}
                </div>
                <a
                  href={githubUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.07] py-2 text-xs text-[#6b7280] hover:text-white transition-colors"
                >
                  <ExternalLink size={11} /> View on GitHub
                </a>
              </div>
            )}
            {!githubLoading && !githubUser && (
              <p className="text-xs text-[#6b7280]">Enter your GitHub profile URL to see a live preview.</p>
            )}
          </div>

          {/* Quick copy card */}
          <div className="synapto-card p-4">
            <p className="label-upper mb-3">Quick Copy</p>
            <div className="space-y-2">
              {PLATFORMS.filter(p => profiles[p.key].trim()).map(({ key, label, color, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => copyLink(profiles[key])}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  <Icon size={12} style={{ color }} />
                  <span className="flex-1 text-xs text-white truncate">{label}</span>
                  {copied === profiles[key]
                    ? <Check size={11} className="text-[#22c55e] shrink-0" />
                    : <Copy size={11} className="text-[#6b7280] shrink-0" />
                  }
                </button>
              ))}
              {profiles.custom.filter(c => c.url.trim()).map((c, i) => (
                <button
                  key={`custom-${i}`}
                  onClick={() => copyLink(c.url)}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  <Link2 size={12} className="text-[#a855f7]" />
                  <span className="flex-1 text-xs text-white truncate">{c.label || c.url}</span>
                  {copied === c.url
                    ? <Check size={11} className="text-[#22c55e] shrink-0" />
                    : <Copy size={11} className="text-[#6b7280] shrink-0" />
                  }
                </button>
              ))}
              {!PLATFORMS.some(p => profiles[p.key].trim()) && !profiles.custom.some(c => c.url.trim()) && (
                <p className="text-xs text-[#6b7280]">No profiles saved yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
