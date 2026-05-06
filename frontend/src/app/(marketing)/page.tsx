export const revalidate = 3600 // ISR - revalidate every hour

import Link from 'next/link'
import { 
  Bot, 
  History, 
  Link2, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Play,
  Gem,
  BrainCircuit,
  LineChart,
  TrendingUp
} from 'lucide-react'
import { MarketingNav } from '@/components/layout/MarketingNav'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#060709] text-white selection:bg-[#00FF87] selection:text-black font-sans">
      <MarketingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 bg-grid-white/[0.02]">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00FF87]/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-[#4F9CFB]/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#94A3B8] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-[#00FF87] animate-pulse" />
            V1.0 LIVE: Powered by Google Gemini
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-700">
            The Journal that <br/>
            <span className="bg-gradient-to-r from-[#00FF87] via-[#4F9CFB] to-[#00FF87] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Coaches You to Win.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-[#94A3B8] max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Stop losing money to patterns you haven't seen yet. Our AI scans your trades to find emotional leaks and technical edges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-10 py-5 bg-[#00FF87] text-[#0D0F14] rounded-full font-black text-xl hover:shadow-[0_0_40px_rgba(0,255,135,0.5)] transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              Start Free Trial
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white border border-white/10 rounded-full font-bold text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Member Login
            </Link>
          </div>

          {/* Trusted by strip */}
          <div className="mt-24 pt-10 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#4B5563] mb-8">Integrated with global brokers</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="text-2xl font-black">TradeStation</span>
              <span className="text-2xl font-black italic">Questrade</span>
              <span className="text-2xl font-black tracking-tighter italic">InteractiveBrokers</span>
              <span className="text-2xl font-black tracking-widest">WEBULL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Analysis Preview Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
               <div className="w-14 h-14 rounded-2xl bg-[#00FF87]/10 flex items-center justify-center">
                  <Bot size={32} className="text-[#00FF87]" />
               </div>
               <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                  "Why did I take <br/> that trade?"
               </h2>
               <p className="text-xl text-[#94A3B8] leading-relaxed">
                  Most traders can’t answer that. Trade Journal AI reads your notes and executions to find the "Subconscious Edge"—the recurring behaviors that actually lead to your wins.
               </p>
               <div className="space-y-6 pt-4">
                  <BenefitItem title="Pattern Detection" desc="AI identifies which setups have the highest probability for YOU." />
                  <BenefitItem title="Emotional Audit" desc="Detects FOMO, Revenge Trading, and Stress in your journal entries." />
                  <BenefitItem title="Prop Firm Readiness" desc="Detailed drawdown tracking (DLL) to ensure you pass your next evaluation." />
               </div>
            </div>

            <div className="relative">
               <div className="aspect-square bg-gradient-to-br from-white/10 to-transparent rounded-3xl border border-white/10 p-6 shadow-2xl overflow-hidden glass-morphism">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-400" />
                       <div className="w-3 h-3 rounded-full bg-yellow-400" />
                       <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="bg-[#00FF87]/10 text-[#00FF87] px-2 py-1 rounded text-[10px] font-bold">LIVE AI ANALYSIS</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-[#4B5563] uppercase mb-2">Insight Found</p>
                        <p className="text-sm font-medium">"You have an 82% win rate on Breakouts before 10:30 AM EST, but only 21% after noon."</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-xs text-[#4B5563] mb-1">Avg R-Multiple</p>
                          <p className="text-xl font-bold text-[#00FF87]">2.4x</p>
                       </div>
                       <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-xs text-[#4B5563] mb-1">Psychology Score</p>
                          <p className="text-xl font-bold text-[#4B5563]">B+</p>
                       </div>
                    </div>
                  </div>
               </div>
               {/* Decorative floating orb */}
               <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#00FF87]/20 rounded-full blur-[80px] -z-10" />
            </div>
        </div>
      </section>

      {/* Advanced Feature Cards */}
      <section className="py-32 bg-[#08090B]">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AdvancedCard 
                icon={<Link2 />}
                title="Seamless Sync"
                desc="Link your broker and focus on trading. We handle the collection and P&L math."
              />
              <AdvancedCard 
                icon={<History />}
                title="Trade Replay"
                desc="Visualize every execution on a cinematic chart with tick-level precision."
              />
              <AdvancedCard 
                icon={<Zap />}
                title="Fast Tagging"
                desc="Auto-tags every trade by Setup, Session, and Market Condition."
              />
           </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Choose Your Edge.</h2>
            <p className="text-[#94A3B8] text-xl max-w-2xl mx-auto">Trading is hard. Your software shouldn't be. Simple pricing, massive value.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              name="Starter"
              price="0"
              desc="Perfect for getting started with journaling."
              features={['Manual Trade Logging', 'Basic Analytics', 'Daily Statistics', 'Email Support']}
            />
            <PricingCard 
              name="Pro"
              price="29"
              desc="For the serious trader building their strategy."
              features={['Everything in Starter', 'Unlimited Auto-Syncing', 'Advanced Analytics', 'Performance Reports', 'Priority Support']}
              featured
            />
            <PricingCard 
              name="Elite"
              price="79"
              desc="The ultimate toolset for professionals."
              features={['Everything in Pro', 'AI Behavioral Coaching', 'Trade Replay Analysis', 'Prop Firm Risk Audit', 'Live Session Insights']}
            />
          </div>
        </div>
      </section>

      {/* Wall of Love (Testimonials) */}
      <section className="py-32 bg-white/5 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-center text-[#4B5563] text-sm uppercase font-black tracking-[0.4em] mb-16">Trusted by the community</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial 
               quote="The AI coach found a pattern in my revenge trading that saved me $4k in the first month."
               author="Marcus V."
               role="SMC Trader"
            />
            <Testimonial 
               quote="Auto-syncing with TradeStation is a game changer. No more late-night data entry."
               author="Sarah L."
               role="Futures Pro"
            />
            <Testimonial 
               quote="The UI feels like I'm trading from the future. It makes the discipline of journaling actually fun."
               author="David K."
               role="Day Trader"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
         <div className="max-w-5xl mx-auto px-6">
            <div className="bg-white rounded-[3rem] p-12 md:p-20 text-[#0D0F14] text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF87]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Start Your Professional Journey Today.</h2>
               <p className="text-xl font-medium text-[#4B5563] mb-12 max-w-2xl mx-auto relative z-10">
                  Join 2,000+ traders building their edge with AI. No credit card required to start your first 14 days.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                  <Link href="/signup" className="w-full sm:w-auto px-12 py-5 bg-[#0D0F14] text-white rounded-full font-black text-xl hover:shadow-2xl transition-all active:scale-95">
                    Sign Up Free
                  </Link>
                  <Link href="/pricing" className="text-xl font-bold border-b-2 border-[#0D0F14] hover:border-[#00FF87] transition-all">View Pricing Plans</Link>
               </div>
            </div>
         </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-20 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded bg-[#00FF87] flex items-center justify-center">
                  <TrendingUp size={12} className="text-[#0D0F14]" />
               </div>
               <span className="font-bold text-white">Trade Journal AI</span>
            </div>
            <div className="flex gap-8 text-sm text-[#4B5563]">
               <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
               <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
               <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            </div>
            <p className="text-sm text-[#4B5563]">© 2026 Trade Journal. All rights reserved.</p>
         </div>
      </footer>
    </div>
  )
}

function BasicBenefitItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 size={16} className="text-[#00FF87]" />
      <span className="text-sm text-[#94A3B8]">{title}</span>
    </div>
  )
}

function BenefitItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 rounded-full bg-[#00FF87]/20 flex items-center justify-center shrink-0 mt-1">
        <CheckCircle2 size={14} className="text-[#00FF87]" />
      </div>
      <div>
        <p className="font-bold text-white">{title}</p>
        <p className="text-sm text-[#4B5563]">{desc}</p>
      </div>
    </div>
  )
}

function AdvancedCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-[#00FF87]/20 hover:bg-white/[0.08] transition-all group">
       <div className="text-[#4B5563] group-hover:text-[#00FF87] mb-6 transition-colors">
          {icon}
       </div>
       <h4 className="text-2xl font-bold mb-4">{title}</h4>
       <p className="text-[#94A3B8] leading-relaxed">{desc}</p>
    </div>
  )
}

function PricingCard({ name, price, desc, features, featured = false }: { name: string, price: string, desc: string, features: string[], featured?: boolean }) {
  return (
    <div className={`p-10 rounded-[2.5rem] border ${featured ? 'bg-white text-[#0D0F14] border-white scale-105 shadow-[0_0_60px_rgba(255,255,255,0.1)]' : 'bg-white/5 border-white/5 text-white'} transition-all flex flex-col`}>
      <div className="mb-8">
        <h4 className="text-xl font-black mb-2 uppercase tracking-widest">{name}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black">$</span>
          <span className="text-6xl font-black">{price}</span>
          <span className={`text-sm ${featured ? 'text-[#4B5563]' : 'text-[#4B5563]'} font-bold`}>/mo</span>
        </div>
      </div>
      
      <p className={`text-sm mb-10 font-medium ${featured ? 'text-[#4B5563]' : 'text-[#94A3B8]'}`}>{desc}</p>
      
      <div className="space-y-4 mb-12 flex-1">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
             <CheckCircle2 size={18} className={featured ? 'text-[#0D0F14]' : 'text-[#00FF87]'} />
             <span className={`text-sm font-medium ${featured ? 'text-[#0D0F14]' : 'text-[#94A3B8]'}`}>{f}</span>
          </div>
        ))}
      </div>

      <Link 
        href="/signup" 
        className={`w-full py-5 rounded-2xl font-black text-center transition-all active:scale-95 ${featured ? 'bg-[#0D0F14] text-white shadow-xl hover:shadow-2xl' : 'bg-white/10 text-white hover:bg-white/20'}`}
      >
        Choose {name}
      </Link>
    </div>
  )
}

function Testimonial({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 italic relative group hover:bg-white/[0.04] transition-all">
       <p className="text-lg text-[#94A3B8] mb-8 relative z-10">"{quote}"</p>
       <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#00FF87]/10 flex items-center justify-center font-bold text-[#00FF87]">
             {author[0]}
          </div>
          <div>
            <p className="not-italic font-bold text-white text-sm">{author}</p>
            <p className="not-italic text-xs text-[#4B5563] font-bold uppercase">{role}</p>
          </div>
       </div>
    </div>
  )
}
