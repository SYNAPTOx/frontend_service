export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#00e5ff]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#a855f7]/5 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
