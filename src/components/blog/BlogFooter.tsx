import Link from "next/link";
import { SaakshMark } from "@/components/SaakshMark";

/* Slim brand footer for the blog surface — no personal byline, no newsletter. */
export function BlogFooter() {
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: "Free tools",
      links: [
        ["/start", "BRSR gap analysis"],
        ["/features/ghg-calculator", "GHG calculators"],
        ["/features/templates", "Templates & workbooks"],
        ["/features/cbam-ccts", "CBAM & CCTS checker"],
      ],
    },
    {
      title: "Resources",
      links: [
        ["/blog", "Blog"],
        ["/features/gap-analysis", "Gap analysis guide"],
        ["/features/collect", "Collect (Pro)"],
        ["/methodology", "Methodology"],
      ],
    },
    {
      title: "Company",
      links: [
        ["/", "Home"],
        ["/privacy", "Privacy"],
        ["/terms", "Terms"],
        ["/security", "Security"],
      ],
    },
  ];

  return (
    <footer className="bg-[#0A1422] text-white mt-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5">
            <SaakshMark size={26} variant="subtle" />
            <span className="font-display font-bold text-[19px] text-white">Saaksh</span>
          </div>
          <p className="text-[13.5px] text-[#9FB0C4] leading-relaxed mt-3 max-w-[230px]">
            Practical BRSR &amp; ESG guidance for Indian consultants. Evidence-first, cited.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B7585]">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-[#BFD0DE] hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-[12.5px] text-[#6B7585]">© {new Date().getFullYear()} Saaksh</span>
          <span className="text-[12px] text-[#6B7585] sm:ml-auto">
            Client data never leaves your browser · Cited to SEBI &amp; ICAI
          </span>
        </div>
      </div>
    </footer>
  );
}
