import AuthGuard from '@/components/AuthGuard'
import Sidebar from '@/components/Sidebar'
import MobileSidebar from '@/components/MobileSidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:h-full md:shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#0a0a0f] px-4 md:hidden">
            <MobileSidebar />
            <span className="text-sm font-black tracking-widest text-[#00e5ff]">SYNAPTO</span>
          </header>

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
