import MedimateIcon from '@/components/medimate-icon';
import { Facebook, Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:gap-12">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center space-x-2">
              <MedimateIcon size={28} color="auto" rotate={22.5} className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="font-bold">Medimate</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your AI-powered healthcare companion, making medical assistance
              accessible and personalized.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold sm:text-base">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold sm:text-base">Features</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: '/chatbot', label: 'Ask Doctor Ai' },
                { href: '/prescription', label: 'Scan Prescription' },
                { href: '/medical-tests', label: 'Medical Tests Analysis' },
                { href: '/recommendation', label: 'Medicine Guide' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-sm font-semibold sm:text-base">
              Connect With Us
            </h3>
            <div className="mt-4 flex space-x-4">
              {[
                { href: '#', icon: Facebook },
                { href: '#', icon: Twitter },
                { href: '#', icon: Linkedin },
                { href: '#', icon: Github },
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={index}
                    href={social.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Follow us on social media</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-xs text-muted-foreground sm:text-sm">
            © {new Date().getFullYear()} Medimate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
