"use client"

import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MedimateIcon from "@/components/medimate-icon"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[600px] text-center">
        {/* Visual Element */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="relative">
            <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20" />
            <MedimateIcon size={96} color="blue" rotate={22.5} className="relative h-16 w-16 text-primary sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          404 - Page Not Found
        </h1>
        <p className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base">
          Oops! It seems like this page is feeling under the weather.
          Don&apos;t worry, we&apos;ve got the right prescription to get you back on track.
        </p>

        {/* Quick Links */}
        <div className="mb-6 inline-flex flex-col gap-4 rounded-lg bg-muted/50 p-4 text-left sm:mb-8">
          <div className="flex items-start gap-3 sm:items-center">
            <Search className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
            <div>
              <h2 className="text-sm font-semibold sm:text-base">Looking for something specific?</h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Try these popular sections:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/chatbot"
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20 sm:text-sm"
                >
                  Ask Doctor AI
                </Link>
                <Link
                  href="/ocr"
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20 sm:text-sm"
                >
                  Scan Prescription
                </Link>
                <Link
                  href="/recommendation"
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20 sm:text-sm"
                >
                  Medicine Guide
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full gap-2 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button asChild className="w-full gap-2 sm:w-auto">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-xs text-muted-foreground sm:mt-8 sm:text-sm">
          Need assistance? Contact our{" "}
          <Link href="/support" className="text-primary hover:underline">
            support team
          </Link>
          .
        </p>
      </div>
    </div>
  )
}