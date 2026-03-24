"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/data/mock-data";
import {
  Home,
  BookOpen,
  Shield,
  Wrench,
  FileText,
  Share2,
  Search,
  Camera,
  FolderOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Clock,
  ChevronRight,
  Building2,
  Smartphone,
  QrCode,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-linen/80 backdrop-blur-md border-b border-clay/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-stone hover:text-hearth transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-stone hover:text-hearth transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm font-medium text-stone hover:text-hearth transition-colors">Pricing</a>
          <a href="#testimonials" className="text-sm font-medium text-stone hover:text-hearth transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-sm text-stone hover:text-hearth">Log in</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-ember hover:bg-ember-dark text-white text-sm">Get Started Free</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-ember/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-clay/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-ember/10 text-ember border-ember/20 px-4 py-1.5 text-sm font-medium">
            Now in beta — Free for early adopters
          </Badge>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold text-hearth tracking-tight leading-[1.1] mb-6">
            The owner&apos;s manual{" "}
            <span className="relative">
              <span className="text-ember">for your home</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8.5C50 2.5 100 2.5 150 6.5C200 10.5 250 4.5 298 6.5" stroke="#E8734A" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
              </svg>
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-stone max-w-2xl mx-auto mb-4 leading-relaxed">
            Stop Googling your own house.
          </p>
          <p className="text-lg text-stone/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Document every appliance, paint color, and maintenance record. Create beautiful handbooks for tenants. Know your home inside and out.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="bg-ember hover:bg-ember-dark text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-ember/25 hover:shadow-xl hover:shadow-ember/30 transition-all">
                Start Documenting — It&apos;s Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/handbook/frisco-2576">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-clay/40 hover:bg-clay/10">
                See a Sample Handbook
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Hero visual - Mock dashboard preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-2xl shadow-hearth/10 border border-clay/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-linen-dark border-b border-clay/20">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-alert/60" />
                  <div className="w-3 h-3 rounded-full bg-caution/60" />
                  <div className="w-3 h-3 rounded-full bg-good/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/80 rounded-md px-4 py-1 text-xs text-stone">threshold.app/dashboard</div>
                </div>
              </div>
              <div className="p-8 bg-linen">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Property card mock */}
                  <div className="bg-white rounded-xl p-4 border border-clay/20 shadow-sm">
                    <div className="h-32 bg-gradient-to-br from-clay/20 to-ember/10 rounded-lg mb-3 flex items-center justify-center">
                      <Home className="h-8 w-8 text-ember/40" />
                    </div>
                    <div className="font-heading font-semibold text-hearth">2576 Frisco Drive</div>
                    <div className="text-sm text-stone">Clearwater, FL · 3 bed / 2 bath</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-linen-dark rounded-full overflow-hidden">
                        <div className="h-full bg-sage w-[94%] rounded-full" />
                      </div>
                      <span className="text-xs text-sage font-medium">94%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-clay/20 shadow-sm">
                    <div className="h-32 bg-gradient-to-br from-sage/10 to-clay/10 rounded-lg mb-3 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-sage/40" />
                    </div>
                    <div className="font-heading font-semibold text-hearth">The Woods</div>
                    <div className="text-sm text-stone">Jacksonville, FL · 4 bed / 3 bath</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-linen-dark rounded-full overflow-hidden">
                        <div className="h-full bg-caution w-[45%] rounded-full" />
                      </div>
                      <span className="text-xs text-caution font-medium">45%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-clay/20 shadow-sm border-dashed hidden lg:flex flex-col items-center justify-center gap-2 text-stone/50">
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-stone/30 flex items-center justify-center">
                      <span className="text-2xl font-light">+</span>
                    </div>
                    <span className="text-sm">Add Property</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -right-4 top-1/4 bg-white rounded-xl shadow-lg border border-clay/20 p-3 animate-fade-in hidden xl:block" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sage/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-sage" />
                </div>
                <div>
                  <div className="text-xs font-medium text-hearth">Handbook Published</div>
                  <div className="text-xs text-stone">2576 Frisco Drive</div>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 bottom-1/3 bg-white rounded-xl shadow-lg border border-clay/20 p-3 animate-fade-in hidden xl:block" style={{ animationDelay: "0.8s" }}>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-ember/20 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-ember" />
                </div>
                <div>
                  <div className="text-xs font-medium text-hearth">HVAC Tune-up Due</div>
                  <div className="text-xs text-stone">April 15, 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-20 lg:py-28 bg-hearth text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold mb-4">Sound familiar?</h2>
          <p className="text-clay-light text-lg max-w-2xl mx-auto">Whether you rent out properties or live in your own home, the same problems keep coming up.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Landlord problems */}
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardContent className="p-8">
              <Badge className="mb-4 bg-ember/20 text-ember-light border-0">Landlords</Badge>
              <ul className="space-y-4">
                {[
                  "Tenant calls at midnight: 'How do I reset the AC?'",
                  "Scrambling to find the water heater model number",
                  "Can't remember which contractor fixed the roof",
                  "New tenants need a walkthrough of everything",
                  "Warranty expires because you forgot to register it",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-alert mt-0.5">×</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Homeowner problems */}
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardContent className="p-8">
              <Badge className="mb-4 bg-clay/20 text-clay-light border-0">Homeowners</Badge>
              <ul className="space-y-4">
                {[
                  "Googling 'how to change filter on [your exact model]'",
                  "A drawer full of manuals you'll never find again",
                  "No idea when the roof was last inspected",
                  "What paint color is the living room? Good question.",
                  "Emergency at 2am and you don't know where the shutoffs are",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-alert mt-0.5">×</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-2xl font-heading text-clay-light">
            There&apos;s a better way.
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Camera, title: "Document Everything", description: "Capture every appliance, fixture, and paint color with photos, model numbers, and notes." },
    { icon: FolderOpen, title: "Organize by Room", description: "Navigate your home room by room. Everything in its place, instantly searchable." },
    { icon: Wrench, title: "Track Maintenance", description: "Never miss a filter change or tune-up. See your complete service history at a glance." },
    { icon: FileText, title: "Store Documents", description: "Warranties, manuals, receipts, and inspections — all in one searchable vault." },
    { icon: Shield, title: "Emergency Ready", description: "Shutoff locations, emergency contacts, and step-by-step procedures when seconds matter." },
    { icon: BookOpen, title: "Tenant Handbooks", description: "Generate beautiful, shareable handbooks that turn move-in chaos into a warm welcome." },
    { icon: QrCode, title: "QR Codes", description: "Print QR codes for each room. Tenants scan and get instant access to everything they need." },
    { icon: Smartphone, title: "Mobile First", description: "Access everything from your phone. Check a model number while you're at the hardware store." },
    { icon: Users, title: "Share Access", description: "Give tenants, property managers, or family members exactly the access they need." },
  ];

  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-sage/10 text-sage border-sage/20">Features</Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-hearth mb-4">Everything you need to know your home</h2>
          <p className="text-stone text-lg max-w-2xl mx-auto">From the brand of paint on your walls to what to do when the power goes out.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature, i) => (
            <Card key={i} className="group bg-white border-clay/20 hover:border-ember/30 hover:shadow-lg hover:shadow-ember/5 transition-all duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-ember/10 flex items-center justify-center mb-4 group-hover:bg-ember/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-ember" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-hearth mb-2">{feature.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Document",
      description: "Walk through your home and capture everything — appliances, paint colors, fixtures, emergency shutoffs. We make it fast and structured.",
      icon: Camera,
      color: "ember",
    },
    {
      step: "02",
      title: "Organize",
      description: "Everything falls into place automatically — organized by property, room, and category. Search anything instantly. Upload documents and receipts.",
      icon: FolderOpen,
      color: "clay",
    },
    {
      step: "03",
      title: "Share",
      description: "Generate a beautiful, branded handbook with one click. Share via link or QR code. Your tenants get everything they need, and you stop getting midnight texts.",
      icon: Share2,
      color: "sage",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-linen-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-ember/10 text-ember border-ember/20">How It Works</Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-hearth mb-4">Three steps to home mastery</h2>
          <p className="text-stone text-lg max-w-2xl mx-auto">Most people finish their first property in under an hour.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-clay/30" />
              )}
              <div className={`relative mx-auto h-24 w-24 rounded-2xl bg-${step.color}/10 flex items-center justify-center mb-6`}>
                <step.icon className={`h-10 w-10 text-${step.color}`} />
                <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-hearth text-white text-sm font-bold flex items-center justify-center">{step.step}</span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-hearth mb-2">{step.title}</h3>
              <p className="text-stone text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for a single home",
      features: [
        "1 property",
        "Unlimited rooms & appliances",
        "Document storage (100 MB)",
        "Basic handbook",
        "Emergency info",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description: "For landlords and serious homeowners",
      features: [
        "Up to 5 properties",
        "Unlimited everything",
        "Document storage (10 GB)",
        "Custom branded handbooks",
        "Maintenance scheduling",
        "QR codes for rooms",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Portfolio",
      price: "$29",
      period: "/month",
      description: "For property managers at scale",
      features: [
        "Unlimited properties",
        "Unlimited everything",
        "Document storage (100 GB)",
        "White-label handbooks",
        "Team access & permissions",
        "API access",
        "Dedicated support",
        "Analytics & reports",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-brass/10 text-brass border-brass/20">Pricing</Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-hearth mb-4">Simple, honest pricing</h2>
          <p className="text-stone text-lg max-w-2xl mx-auto">Start free. Upgrade when you need more properties or features.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card key={i} className={`relative bg-white border-clay/20 ${plan.popular ? "border-ember shadow-xl shadow-ember/10 scale-105" : "hover:shadow-lg"} transition-all`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-ember text-white border-0 shadow-lg shadow-ember/25">Most Popular</Badge>
                </div>
              )}
              <CardContent className="p-8">
                <h3 className="font-heading text-xl font-semibold text-hearth mb-1">{plan.name}</h3>
                <p className="text-sm text-stone mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-heading font-bold text-hearth">{plan.price}</span>
                  <span className="text-stone text-sm">{plan.period}</span>
                </div>
                <Link href="/dashboard">
                  <Button className={`w-full ${plan.popular ? "bg-ember hover:bg-ember-dark text-white" : "bg-hearth hover:bg-hearth/90 text-white"}`}>
                    {plan.cta}
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-stone">
                      <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-linen-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-ember/10 text-ember border-ember/20">Testimonials</Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-hearth mb-4">Loved by homeowners and landlords</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto stagger-children">
          {testimonials.map((t, i) => (
            <Card key={i} className="bg-white border-clay/20">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-caution text-caution" />
                  ))}
                </div>
                <p className="text-hearth mb-4 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-ember/10 flex items-center justify-center text-ember font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-hearth text-sm">{t.name}</div>
                    <div className="text-xs text-stone">{t.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-hearth mb-6">
          Your home deserves better than a junk drawer full of manuals
        </h2>
        <p className="text-lg text-stone max-w-2xl mx-auto mb-10">
          Join thousands of homeowners and landlords who finally know their homes inside and out.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-ember hover:bg-ember-dark text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-ember/25">
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-stone mt-4">No credit card required · Free forever for 1 property</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-hearth text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="font-heading text-2xl font-semibold mb-4">
              <span className="text-ember">t</span>hreshold
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              The owner&apos;s manual for your home. Document, organize, and share everything about your property.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/40">Product</h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "Handbook Preview", "Mobile App", "API"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/40">Resources</h4>
            <ul className="space-y-2">
              {["Help Center", "Blog", "Home Maintenance Guide", "Landlord Resources", "Community"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/40">Company</h4>
            <ul className="space-y-2">
              {["About", "Careers", "Press", "Privacy", "Terms"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/40">© 2026 Threshold. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-linen">
      <Navbar />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <Pricing />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
