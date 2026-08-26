import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, Mail, Phone, MessageCircle, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the ScriptFlow AI team. We're here to help with any questions about your account, billing, or the product.",
}

export default function ContactPage() {
  const phone = "+919824466624"
  const displayPhone = "+91 98244 66624"
  const email = "parth.brahmkshatriya@gmail.com"
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hi! I have a question about ScriptFlow AI.")}`

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05]"
        style={{ background: "rgba(3,3,5,0.80)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight">
            <div className="size-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)" }}>
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span className="text-white">ScriptFlow AI</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="size-3.5" /> Back to home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative pt-32 pb-20 px-5 text-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full opacity-10 blur-[120px]"
            style={{ background: "radial-gradient(circle,#a855f7,transparent 70%)" }} />
        </div>
        <div className="relative max-w-xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-violet-400 mb-4">Get in touch</p>
          <h1 className="font-black text-4xl sm:text-5xl tracking-tight leading-tight mb-4">
            We&apos;d love to{" "}
            <span style={{ backgroundImage: "linear-gradient(90deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              hear from you
            </span>
          </h1>
          <p className="text-zinc-500 text-lg">
            Questions about your account, billing, or the product? Reach out — we typically reply within a few hours.
          </p>
        </div>
      </div>

      {/* Contact cards */}
      <div className="max-w-3xl mx-auto px-5 pb-28 grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Email */}
        <a
          href={`mailto:${email}`}
          className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-200"
        >
          <div className="size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.25),rgba(168,85,247,0.08))", border: "1px solid rgba(168,85,247,0.3)" }}>
            <Mail className="size-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Email</p>
            <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors break-all">
              {email}
            </p>
            <p className="text-xs text-zinc-600 mt-1">Reply within a few hours</p>
          </div>
        </a>

        {/* Phone */}
        <a
          href={`tel:${phone}`}
          className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-200"
        >
          <div className="size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.25),rgba(59,130,246,0.08))", border: "1px solid rgba(59,130,246,0.3)" }}>
            <Phone className="size-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Phone</p>
            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
              {displayPhone}
            </p>
            <p className="text-xs text-zinc-600 mt-1">Mon – Sat, 10 am – 7 pm IST</p>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200"
        >
          <div className="size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.25),rgba(34,197,94,0.08))", border: "1px solid rgba(34,197,94,0.3)" }}>
            <MessageCircle className="size-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">WhatsApp</p>
            <p className="text-sm font-semibold text-white group-hover:text-green-300 transition-colors">
              {displayPhone}
            </p>
            <p className="text-xs text-zinc-600 mt-1">Chat with us directly</p>
          </div>
        </a>
      </div>

      {/* WhatsApp CTA button */}
      <div className="max-w-3xl mx-auto px-5 pb-28 -mt-16 flex justify-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 shadow-lg shadow-green-900/30 hover:shadow-green-900/50 hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
        >
          {/* WhatsApp SVG logo */}
          <svg viewBox="0 0 24 24" className="size-5 fill-white shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.1 1.522 5.825L.057 23.428a.5.5 0 0 0 .515.572l5.797-1.521A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.007-1.373l-.36-.213-3.724.977.994-3.632-.235-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
          </svg>
          Chat with us on WhatsApp
        </a>
      </div>

      {/* Footer strip */}
      <footer className="border-t border-white/[0.05] py-8 px-5 text-center text-xs text-zinc-700"
        style={{ background: "#020204" }}>
        <p>© {new Date().getFullYear()} ScriptFlow AI · <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link></p>
      </footer>
    </div>
  )
}
