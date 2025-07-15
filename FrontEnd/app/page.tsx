"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Brain,
  FileText,
  MessageSquare,
  ArrowRight,
  Shield,
  Users,
  Star,
  Activity,
  Clock,
  PhoneCall,
  ArrowDown,
  CheckCircle,
  Zap,
  Download,
  Sparkles,
  HeartPulse,
  Stethoscope,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MedimateIcon from "@/components/medimate-icon"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

// Counter animation function
function useCountAnimation(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [end, duration, isVisible])

  return { count, setIsVisible }
}

export default function Home() {
  useScrollAnimation()

  // Stats data with animations
  const stats = [
    { 
      value: 50000,
      label: "Active Users",
      suffix: "+",
      icon: Users,
      description: "Trusted by healthcare professionals worldwide",
      delay: 0 
    },
    { 
      value: 99.9,
      label: "Accuracy Rate",
      suffix: "%",
      icon: Activity,
      description: "AI-powered precision in medical analysis",
      delay: 200 
    },
    { 
      value: 24,
      label: "Support",
      suffix: "/7",
      icon: PhoneCall,
      description: "Round-the-clock medical assistance",
      delay: 400 
    },
    { 
      value: 4.9,
      label: "User Rating",
      suffix: "/5",
      icon: Star,
      description: "Highly rated by our community",
      delay: 600 
    }
  ]

  // Create counter animations for each stat
  const counters = stats.map(stat => useCountAnimation(stat.value))

  // Intersection Observer for triggering animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger all counter animations
            counters.forEach(counter => counter.setIsVisible(true))
            
            // Add visible class for fade animations
            entry.target.classList.add("visible")
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: "-50px",
      }
    )

    const statsSection = document.querySelector("#stats-section")
    if (statsSection) {
      observer.observe(statsSection)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Background with optimized overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80"
            alt="Medical Background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-500/80 to-gray-900" />
        </div>

        {/* Main Content */}
        <div className="container relative">
          <div className="grid min-h-[calc(100vh-4rem)] items-center gap-8 py-12 md:gap-16 md:py-20 lg:grid-cols-2">
            {/* Left Column - Main Content */}
            <div className="flex flex-col items-center space-y-8 text-center lg:items-start lg:text-left">
              {/* Status Badge */}
              <div 
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-lg"
                role="status"
              >
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span>AI System Active & Ready</span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                  Your Personal
                  <span className="relative mt-2 block">
                    <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-400 to-black-400 opacity-20" />
                    <span className="relative bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Medical Assistant
                    </span>
                  </span>
                </h1>
                <p className="mx-auto max-w-[600px] text-base text-white/90 sm:text-lg lg:mx-0">
                  Experience healthcare reimagined with AI-powered guidance, instant analysis, and personalized care.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                <Button 
                  size="lg" 
                  className="group relative w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
                  asChild
                >
                  <Link href="/chatbot" className="flex items-center justify-center gap-2">
                    Start Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-white/20 bg-white/5 text-white backdrop-blur-lg hover:bg-white/10 sm:w-auto"
                  asChild
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>

              {/* Key Stats */}
              <div className="grid w-full grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:gap-8 sm:pt-8">
                {[
                  { number: "24/7", label: "Support", icon: Clock },
                  { number: "99%", label: "Accuracy", icon: CheckCircle },
                  { number: "10k+", label: "Users", icon: Users },
                ].map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="mb-1 text-xl font-bold text-white sm:mb-2 sm:text-3xl">{stat.number}</div>
                      <div className="flex items-center justify-center gap-1 text-xs text-white/70 sm:text-sm">
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{stat.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="relative hidden lg:block">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-6">
                {[
                  {
                    icon: MessageSquare,
                    title: "24/7 AI Support",
                    description: "Get instant medical guidance anytime",
                  },
                  {
                    icon: FileText,
                    title: "Smart Analysis",
                    description: "Upload & analyze prescriptions instantly",
                  },
                  {
                    icon: () => <MedimateIcon size={34} color="white" rotate={22.5} />,
                    title: "Personalized Care",
                    description: "Tailored health recommendations",
                  },
                ].map((card, index) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={index}
                      className="group relative transform rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg transition-all hover:-translate-y-1 hover:bg-white/10"
                      style={{
                        transform: `translateX(${index * 20}px)`,
                        animationDelay: `${index * 200}ms`,
                      }}
                    >
                      <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3 transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
                      <p className="text-sm text-white/70">{card.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-white/70">Scroll to explore</span>
            <ArrowDown className="h-5 w-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section 
        id="stats-section"
        className="relative overflow-hidden bg-primary py-16 sm:py-20 md:py-24"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80')] opacity-10" />
        <div className="container relative text-center">
          <div className="grid gap-4 rounded-3xl bg-white/5 p-6 text-white backdrop-blur-sm sm:grid-cols-2 sm:gap-6 sm:p-8 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const { count } = counters[index]
              
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center transition-all duration-700"
                  style={{ 
                    transitionDelay: `${stat.delay}ms`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                  data-animate="true"
                >
                  <Icon className="h-8 w-8 mb-3 animate-bounce sm:h-10 sm:w-10 sm:mb-4" />
                  <div className="flex items-baseline justify-center">
                    <div className="text-3xl font-bold sm:text-4xl">
                      {count}
                    </div>
                    <div className="text-xl sm:text-2xl">
                      {stat.suffix}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-white/80 sm:text-base">
                    {stat.label}
                  </div>
                  <p className="mt-2 text-xs text-white/60 sm:text-sm">
                    {stat.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="container py-16 sm:py-20 md:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl scroll-animate">
            Revolutionizing Healthcare
          </h2>
          <p className="mt-4 text-muted-foreground">
            Experience the future of medical assistance with our cutting-edge features
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Stethoscope,
              title: "AI Medical Chat",
              description: "Get instant answers to your medical queries from our advanced AI system.",
              color: "text-blue-500",
            },
            {
              icon: FileText,
              title: "Smart Prescription Analysis",
              description: "Upload and analyze medical prescriptions with high accuracy.",
              color: "text-emerald-500",
            },
            {
              icon: HeartPulse,
              title: "Health Monitoring",
              description: "Track your vital signs and health metrics in real-time.",
              color: "text-red-500",
            },
            {
              icon: Brain,
              title: "Personalized Insights",
              description: "Receive tailored health recommendations based on your profile.",
              color: "text-purple-500",
            },
            {
              icon: Sparkles,
              title: "Smart Recommendations",
              description: "Get AI-powered medicine and treatment suggestions.",
              color: "text-amber-500",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Your health data is protected with enterprise-grade security.",
              color: "text-indigo-500",
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg scroll-animate" 
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className={`mb-4 inline-flex rounded-xl bg-primary/10 p-3 ${feature.color}`}>
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold sm:text-xl">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground sm:text-base">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* App Preview Section */}
      <section className="bg-muted/30 py-16 scroll-animate sm:py-20 md:py-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                  Experience Healthcare Innovation
                </h2>
                <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                  Our intuitive interface makes managing your health easier than ever. Access all features from any device, anytime.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle, text: "Intuitive & user-friendly interface" },
                  { icon: Clock, text: "Available 24/7 for your convenience" },
                  { icon: Download, text: "Works offline for uninterrupted access" },
                  { icon: PhoneCall, text: "Instant support when you need it" },
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                      </div>
                      <span className="text-sm sm:text-base">{item.text}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto">
                  Try Demo
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative order-first md:order-last">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?w=800&h=600&auto=format&fit=crop&q=80"
                  alt="App Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-16 sm:py-20 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col justify-center space-y-6 scroll-animate">
            <div>
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Why Choose Medimate?
              </h2>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Experience healthcare assistance like never before with our advanced AI-powered platform.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  icon: Shield,
                  title: "Secure & Private",
                  description: "Your medical data is encrypted and protected.",
                },
                {
                  icon: Zap,
                  title: "Fast & Accurate",
                  description: "Get instant analysis and recommendations.",
                },
                {
                  icon: Users,
                  title: "User-Friendly",
                  description: "Intuitive interface for all age groups.",
                },
                {
                  icon: Star,
                  title: "Trusted Platform",
                  description: "Used by thousands of satisfied users.",
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg scroll-animate" 
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl transition-all group-hover:scale-150" />
                    <div className="relative">
                      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="relative hidden md:block scroll-animate">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=1000&auto=format&fit=crop&q=80"
                alt="Medical Professional"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-16 sm:py-20 md:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl scroll-animate">
            Trusted by Healthcare Professionals
          </h2>
          <p className="mt-4 text-muted-foreground">
            See what our users have to say about their experience
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Dr. Sarah Johnson",
              role: "Cardiologist",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=60",
              content: "Medimate has transformed how I manage patient care. The AI analysis is incredibly accurate and saves valuable time.",
            },
            {
              name: "Dr. Michael Chen",
              role: "General Practitioner",
              image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&auto=format&fit=crop&q=60",
              content: "The prescription analysis feature is a game-changer. It helps prevent medication errors and improves patient safety.",
            },
            {
              name: "Emily Rodriguez",
              role: "Pharmacist",
              image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&auto=format&fit=crop&q=60",
              content: "As a pharmacist, I appreciate the accuracy of medicine recommendations. It's an invaluable tool for healthcare professionals.",
            },
          ].map((testimonial, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg scroll-animate"
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl transition-all group-hover:scale-150" />
              <div className="relative flex flex-col items-center text-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-primary/10 sm:h-24 sm:w-24">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold sm:text-xl">{testimonial.name}</h3>
                <p className="text-sm text-primary">{testimonial.role}</p>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">{testimonial.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t bg-muted/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="container relative py-16 text-center scroll-animate sm:py-20 md:py-24">
          <div className="mx-auto max-w-[800px] space-y-6">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Join thousands of healthcare professionals who trust Medimate for better patient care
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required · Free 14-day trial · Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}