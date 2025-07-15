'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AuthButtons } from '@/components/auth-buttons';
import MedimateIcon from '@/components/medimate-icon';
import {
  FileText,
  Home,
  Menu,
  MessageSquare,
  User,
  ArrowDown,
  FlaskRound as Flask,
  Brain,
  Shield,
} from 'lucide-react';
import { Button } from './ui/button';

const routes = [
  {
    href: '/chatbot',
    label: 'Ask Doctor AI',
    icon: MessageSquare,
    description: '24/7 AI-powered medical guidance',
  },
  {
    href: '/prescription',
    label: 'Scan Prescription',
    icon: FileText,
    description: 'Smart prescription analysis & insights',
  },
  {
    href: '/medical-tests',
    label: 'Medical Tests',
    icon: Flask,
    description: 'Analyze and track your test results',
  },
  {
    href: '/drug-interactions',
    label: 'Drug Interactions',
    icon: Shield,
    description: 'Check for potential drug interactions',
  },
  {
    href: '/recommendation',
    label: 'Medicine Guide',
    icon: Brain,
    description: 'AI-powered medicine & treatment suggestions',
  },
  {
    href: '/profile',
    label: 'My Health',
    icon: User,
    description: 'Your personal health dashboard',
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center justify-between sm:h-16">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <MedimateIcon size={32} color="auto" rotate={22.5} className="h-8 w-8 sm:h-10 sm:w-10" />
              <span className="font-bold">Medimate</span>
            </div>
          </Link>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2 lg:space-x-4">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'group relative flex items-center space-x-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent lg:px-3 lg:py-2',
                    pathname === route.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline-block">{route.label}</span>
                  <div className="absolute left-1/2 top-full z-50 mt-1 hidden -translate-x-1/2 transform group-hover:block">
                    <div className="relative">
                      <ArrowDown className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-2 transform text-primary" />
                      <div className="gradient-bg whitespace-nowrap rounded-lg p-2 text-xs text-white shadow-lg">
                        {route.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ModeToggle />
          <div className="hidden md:block">
            <AuthButtons />
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-[400px] p-0">
              <div className="flex h-full flex-col">
                <div className="border-b p-4">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <MedimateIcon size={32} color="auto" rotate={22.5} className="h-8 w-8 sm:h-10 sm:w-10" />
                      <span className="font-bold">Medimate</span>
                    </div>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col space-y-2 p-4">
                    {routes.map((route) => {
                      const Icon = route.icon;
                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex flex-col space-y-1 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                            pathname === route.href
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{route.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {route.description}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t p-4">
                  <div className="flex flex-col space-y-4">
                    <AuthButtons />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
