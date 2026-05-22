"use client"

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar from './Sidebar'

export default function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-white/5 hover:text-white md:hidden">
        {open ? <X size={18} /> : <Menu size={18} />}
      </SheetTrigger>
      <SheetContent side="left" className="w-44 border-r border-white/[0.07] bg-[#0a0a0f] p-0">
        <div className="h-full" onClick={() => setOpen(false)}>
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}
