"use client"

import { useEffect, useRef, useState } from 'react'
import { getUserMe, updateIdCard } from '@/lib/api'
import { Upload, RotateCcw, Save, Loader2, CreditCard, Info } from 'lucide-react'

async function compressImage(file: File, maxWidth = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = e => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function IdCardPage() {
  const [front, setFront] = useState('')
  const [back, setBack]   = useState('')
  const [flipped, setFlipped] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getUserMe().then((u: any) => {
      if (u?.idCardFront) setFront(u.idCardFront)
      if (u?.idCardBack)  setBack(u.idCardBack)
    }).catch(() => {})
  }, [])

  const handleFile = async (file: File, side: 'front' | 'back') => {
    try {
      const compressed = await compressImage(file)
      if (side === 'front') setFront(compressed)
      else setBack(compressed)
    } catch {}
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateIdCard({ idCardFront: front, idCardBack: back })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const hasAny = front || back

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="label-upper">Student</p>
        <h1 className="mt-0.5 text-2xl font-black uppercase tracking-tight text-white">
          DIGITAL <span className="text-[#00e5ff]">ID CARD</span>
        </h1>
        <p className="mt-1 text-xs text-[#6b7280]">Upload your college ID card — flip it, share it, never lose it</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-[#a855f7]/20 bg-[#a855f7]/5 px-4 py-3">
        <Info size={13} className="text-[#a855f7] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#a855f7]">
          Images are stored securely in your account. Compress them before uploading for best performance.
          Never share your ID card publicly — this page is only visible to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* Card preview */}
        <div className="lg:col-span-3 flex flex-col items-center gap-4">
          <p className="label-upper self-start">Preview — click card to flip</p>

          {/* 3D flip container */}
          <div
            className="relative cursor-pointer select-none"
            style={{ width: '100%', maxWidth: 440, aspectRatio: '85.6/54', perspective: '1200px' }}
            onClick={() => setFlipped(f => !f)}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front face */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/[0.1] bg-[#111118]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {front ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={front} alt="ID Front" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-[#6b7280]">
                    <CreditCard size={36} />
                    <p className="text-xs">Front side — upload below</p>
                  </div>
                )}
                {/* Flip hint overlay */}
                <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/60">
                  Front · tap to flip
                </div>
              </div>

              {/* Back face */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/[0.1] bg-[#111118]"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                {back ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={back} alt="ID Back" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-[#6b7280]">
                    <CreditCard size={36} />
                    <p className="text-xs">Back side — upload below</p>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/60">
                  Back · tap to flip
                </div>
              </div>
            </div>
          </div>

          {/* Flip button */}
          <button
            onClick={() => setFlipped(f => !f)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.07] px-4 py-2 text-xs text-[#6b7280] hover:text-white transition-colors"
          >
            <RotateCcw size={12} /> Flip Card
          </button>
        </div>

        {/* Upload controls */}
        <div className="lg:col-span-2 space-y-4">
          <p className="label-upper">Upload Images</p>

          {/* Front upload */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Front Side</p>
            <input
              ref={frontRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, 'front') }}
            />
            <button
              onClick={() => frontRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-xs transition-colors ${
                front ? 'border-[#00e5ff]/40 text-[#00e5ff]' : 'border-white/[0.08] text-[#6b7280] hover:border-white/20'
              }`}
            >
              <Upload size={14} />
              {front ? 'Front uploaded — click to replace' : 'Choose front image'}
            </button>
          </div>

          {/* Back upload */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Back Side</p>
            <input
              ref={backRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, 'back') }}
            />
            <button
              onClick={() => backRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-xs transition-colors ${
                back ? 'border-[#a855f7]/40 text-[#a855f7]' : 'border-white/[0.08] text-[#6b7280] hover:border-white/20'
              }`}
            >
              <Upload size={14} />
              {back ? 'Back uploaded — click to replace' : 'Choose back image'}
            </button>
          </div>

          {/* Save */}
          {hasAny && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#00e5ff] py-3 text-[11px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save ID Card'}
            </button>
          )}
          {saved && <p className="text-xs text-[#22c55e]">ID card saved to your account</p>}

          {/* Tips */}
          <div className="synapto-card p-4 space-y-2">
            <p className="label-upper">Tips</p>
            <ul className="space-y-1.5 text-[10px] text-[#6b7280]">
              <li>· Take the photo in good lighting</li>
              <li>· Use portrait orientation for taller ID cards</li>
              <li>· Images are automatically compressed</li>
              <li>· Show this page to bypass physical card checks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
