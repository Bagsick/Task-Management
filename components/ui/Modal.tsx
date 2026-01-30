'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-950 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-800/50 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800/50 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/20">
                    <h2 className="text-[13px] font-black text-gray-900 dark:text-slate-50 uppercase tracking-[0.15em]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-slate-600 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
