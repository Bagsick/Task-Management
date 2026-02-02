'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white border-b border-white/30 shadow-lg">
        <div className="flex items-center justify-between px-6 md:px-16 py-4">
          <Link
            href="/"
            className="flex items-center transition-all duration-300 hover:scale-110 hover:brightness-125 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            <img src="/transparent-nav-logo.png" alt="Task-O Logo" className="h-10 md:h-12" />
          </Link>

          
          {/*<div className="hidden md:flex space-x-10 text-gray-700 font-medium">
            {['About', 'Features', 'Contact'].map((item) => (
              <Link
                key={item}  
                href={`/#${item.toLowerCase()}`}
                className="relative group"
              >
                <span className="group-hover:text-gray-900 transition-colors duration-300">
                  {item}
                </span>
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-gray-600 via-gray-800 to-black transition-all duration-300 group-hover:w-full shadow-lg group-hover:shadow-gray-500/50"></span>
              </Link>
            ))}
          </div>*/}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <section className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-black/90 -z-10"></div>
        <div
          className="absolute inset-0 opacity-10 -z-10"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        ></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-16 py-12 relative z-10">

          {/* LEFT ILLUSTRATION PANEL */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-8">
            <div className="relative animate-float" data-animate id="login-logo">
              <div className={`transition-all duration-1000 ${isVisible['login-logo'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <img src="/logo-1-primary.png" alt="Logo" className="w-full max-w-xs md:max-w-sm lg:max-w-md drop-shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600 blur-3xl opacity-30 -z-10"></div>
              </div>
            </div>

            <div className="relative animate-float-delayed" data-animate id="login-illustration">
              <div className={`transition-all duration-1000 delay-300 ${isVisible['login-illustration'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <img src="/work.png" alt="Work illustration" className="w-full max-w-[150px] md:max-w-[250px] lg:max-w-[350px] drop-shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-700 blur-3xl opacity-30 -z-10"></div>
              </div>
            </div>

            <div className="space-y-4 text-center max-w-md" data-animate id="login-feature">
              <div className={`transition-all duration-1000 delay-500 ${isVisible['login-feature'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex items-center justify-center space-x-3 text-white drop-shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">Access your account securely</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT LOGIN PANEL */}
          <div className="flex items-center justify-center" data-animate id="login-form">
            <div className={`w-full max-w-md space-y-6 bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/30 hover:shadow-gray-500/20 transition-all duration-1000 ${isVisible['login-form'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>

              <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-gray-900 to-black bg-clip-text text-transparent">
                  Task-O
                </h1>

                <h2 className="text-2xl font-semibold text-gray-800">Sign in to your account</h2>
                <p className="text-gray-600">Welcome back! Enter your details below.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-gray-900 h-5 w-5 transition-colors z-10" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300 text-gray-900"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-gray-900 h-5 w-5 transition-colors z-10" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300 text-gray-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black hover:shadow-2xl hover:shadow-gray-500/50 text-white py-4 rounded-xl transition-all duration-300 hover:scale-105 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Sign in</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <p className="text-sm text-gray-600 text-center pt-2">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-semibold text-gray-800 hover:text-black transition-colors">
                    Sign up
                  </Link>
                </p>
              </form>

            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 6s ease-in-out infinite; animation-delay: 1s; }
      `}</style>
    </div>
  )
}
