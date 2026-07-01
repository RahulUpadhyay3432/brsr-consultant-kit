import Link from "next/link";
import { SaakshMark } from "@/components/SaakshMark";

/* Slim sticky header for the blog surface. Server-safe, links only, no client state. */
export function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#FBFCFE]/90 backdrop-blur-md border-b border-[#E5E9F0]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <SaakshMark size={28} />
          <span className="font-display font-bold text-[19px] text-[#0F172A]">Saaksh</span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-6 ml-4">
          <Link href="/" className="text-[14px] text-[#5B6573] hover:text-[#0F172A] transition-colors">Home</Link>
          <Link href="/blog" className="text-[14px] font-semibold text-[#0F172A]">Blog</Link>
          <Link href="/features/gap-analysis" className="text-[14px] text-[#5B6573] hover:text-[#0F172A] transition-colors">Free tools</Link>
        </nav>

        {/* CTA */}
        <Link
          href="/start"
          className="ml-auto inline-flex items-center gap-2 bg-[#0B6FD4] hover:bg-[#0B5FB0] text-white text-[13.5px] font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          Start a free report
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
