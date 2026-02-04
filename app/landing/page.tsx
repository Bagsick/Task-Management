'use client'

import Link from 'next/link'
import { LogIn, UserPlus, CheckCircle, Sparkles, Zap, Cog, Target } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100">
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/30 shadow-lg">
        <div className="flex items-center justify-between px-6 md:px-16 py-4">
          {/* Logo */}
          <div className="flex items-center transition-all duration-300 hover:scale-110 hover:brightness-125 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            <img src="/transparent-nav-logo.png" alt="Task-O Logo" className="h-10 md:h-12" />
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-10 text-gray-700 font-medium">
            {['About', 'Features', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative group"
              >
                <span className="group-hover:text-gray-900 transition-colors duration-300">
                  {item}
                </span>

                {/* Animated underline */}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-gray-600 via-gray-800 to-black transition-all duration-300 group-hover:w-full shadow-lg group-hover:shadow-gray-500/50"></span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO / ABOUT SECTION */}
      <section
        id="about"
        className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      >
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-black/90 -z-10"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10 -z-10" style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>

        {/* Text */}
        <div className="md:w-1/2 space-y-6 relative z-10" data-animate id="hero-text">
          <div className={`transition-all duration-1000 ${isVisible['hero-text'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white drop-shadow-2xl">
              Manage Your Tasks <br /> 
              <span className="bg-gradient-to-r from-gray-200 via-gray-300 to-white bg-clip-text text-transparent">
                Effortlessly
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/95 drop-shadow-lg">
              Task-O helps you organize projects, track progress, and boost productivity—all in one place.
            </p>

            <div className="flex space-x-4 pt-4">
              <Link
                href="/login"
                className="group bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
              >
                <LogIn className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span>Login</span>
              </Link>

              <Link
                href="/signup"
                className="group bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
              >
                <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Illustration */}
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center relative" data-animate id="hero-image">
          <div className={`transition-all duration-1000 delay-300 ${isVisible['hero-image'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative animate-float">
              <img
                src="/work.png"
                alt="Illustration"
                className="w-full max-w-sm md:max-w-md lg:max-w-lg drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600 blur-3xl opacity-30 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        className="px-6 md:px-16 py-20 relative z-10"
      >
        <div data-animate id="features-title" className={`transition-all duration-1000 ${isVisible['features-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-gray-700 via-gray-900 to-black bg-clip-text text-transparent">
            Why Task-O?
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Discover the powerful features that make task management a breeze
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[{icon:CheckCircle,title:'Organize Tasks',description:'Easily create and organize tasks for yourself or your team with intuitive drag-and-drop interfaces.',color:'gray-700',delay:'0ms'},
            {icon:Zap,title:'Track Progress',description:'Visualize your project progress with intuitive dashboards and real-time analytics.',color:'gray-800',delay:'200ms'},
            {icon:Cog,title:'Boost Productivity',description:'Stay focused, set deadlines, and achieve your goals faster with smart reminders.',color:'gray-900',delay:'400ms'}].map((feature,index)=>{
            const colorMap: Record<string,string> = {'gray-700':'bg-blue-700','gray-800':'bg-violet-800','gray-900':'bg-green-900'};
            return (
              <div key={index} data-animate id={`feature-${index}`} style={{ transitionDelay: feature.delay }} className={`group relative transition-all duration-1000 ${isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative h-full p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`${colorMap[feature.color]} p-4 rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-gray-300/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-gray-300/30 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ) 
          })}
        </div>
      </section>

      {/* FOOTER / CONTACT */}
      <footer id="contact" className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white py-12 mt-auto border-t border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative z-10 text-center space-y-4">
          <div className="text-3xl font-extrabold bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 bg-clip-text text-transparent mb-4">
            Task-O
          </div>
          <p className="text-lg">&copy; {new Date().getFullYear()} Task-O. All rights reserved.</p>
          <p className="text-gray-400">
            Contact us: <a href="mailto:support@task-o.com" className="text-gray-300 hover:text-white transition-colors">support@task-o.com</a>
          </p>

          <div className="flex justify-center space-x-6 pt-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
