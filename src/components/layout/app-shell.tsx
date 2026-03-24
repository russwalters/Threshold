"use client";

import { Sidebar } from "./sidebar";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-stone hover:bg-accent hover:text-hearth transition-colors">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-linen/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <MobileSidebar />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
              <Input
                placeholder="Search properties, appliances..."
                className="pl-10 w-64 bg-white/80 border-border"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-stone" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-ember" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
