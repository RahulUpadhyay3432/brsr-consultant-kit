import Link from "next/link";
import type { Metadata } from "next";
import { getPost, formatDate, CATEGORY_COLORS, BLOG_POSTS, BlogCategory, BlogPost } from "@/data/blog-posts";
import { BLOG_CONTENT } from "@/content/blog-content";
import { BlogCoverArt } from "@/components/blog/BlogCoverArt";
import { BlogToc } from "@/components/blog/BlogToc";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";

const SERIF: React.CSSProperties = { fontFamily: "var(--font-newsreader), Georgia, serif" };

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return { title: "Post not found | Saaksh Blog" };
  return {
    title: `${post.title} | Saaksh`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function CategoryPill({ category }: { category: BlogCategory }) {
  const colors = CATEGORY_COLORS[category];
  return (
    <span
      className="text-[11.5px] font-semibold px-2.5 py-1 rounded-md border tracking-wide"
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {category}
    </span>
  );
}

/* Small related-post card for the bottom "More from the blog" strip. */
function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl bg-white border border-[#E5E9F0] overflow-hidden transition-all duration-200 hover:shadow-elev-2 hover:-translate-y-0.5"
      style={{ boxShadow: "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)" }}
    >
      <BlogCoverArt post={post} className="w-full aspect-[16/9]" />
      <div className="flex flex-col flex-1 p-5 gap-2">
        <div className="flex items-center gap-2">
          <CategoryPill category={post.category} />
          <span className="text-[11px] text-[#5B6573]">{post.readTime}</span>
        </div>
        <h3
          className="text-[#0F172A] leading-[1.25] group-hover:text-[#0B6FD4] transition-colors duration-150"
          style={{ ...SERIF, fontWeight: 600, fontSize: "1.18rem" }}
        >
          {post.title}
        </h3>
        <p className="text-[12.5px] leading-[1.6] text-[#5B6573] line-clamp-2">{post.excerpt}</p>
      </div>
    </Link>
  );
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FBFCFE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#5B6573] text-[15px] mb-4">Post not found.</p>
          <Link href="/blog" className="text-[14px] font-semibold text-[#0B6FD4] hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const content = BLOG_CONTENT[post.slug];

  // Related: same category first, then most recent, excluding self. Up to 3.
  const related = [
    ...BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category),
    ...BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category !== post.category),
  ].slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FBFCFE] flex flex-col">
      <BlogHeader />

      <main className="flex-1">
        <div className="anim-up-sm max-w-[1080px] mx-auto px-6 py-10">

          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#5B6573] hover:text-[#0B6FD4] transition-colors mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Blog
          </Link>

          {/* Cover — full width */}
          <BlogCoverArt post={post} className="w-full aspect-[16/9] rounded-2xl mb-10" />

          {/* Two-column: TOC left + Article right */}
          <div className="lg:grid lg:grid-cols-[216px_1fr] lg:gap-14">

            <aside className="hidden lg:block">
              <BlogToc />
            </aside>

            <article id="article-body" className="min-w-0">

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <CategoryPill category={post.category} />
                <span className="text-[12.5px] text-[#5B6573]">{formatDate(post.date)}</span>
                <span className="text-[#D0D5DD]">·</span>
                <span className="text-[12.5px] text-[#5B6573]">{post.readTime}</span>
                <span className="text-[#D0D5DD]">·</span>
                <span className="text-[12.5px] text-[#5B6573]"><span className="font-semibold text-[#0F172A]">Saaksh</span></span>
              </div>

              {/* Title */}
              <h1
                className="text-[#0F172A] leading-[1.12] tracking-[-0.018em] mb-8"
                style={{ ...SERIF, fontWeight: 600, fontSize: "clamp(2rem, 3.5vw, 2.9rem)", textWrap: "balance" }}
              >
                {post.title}
              </h1>

              {/* Content */}
              <div className="pb-14">
                {content ?? (
                  <p style={{ ...SERIF, fontSize: "17.5px", lineHeight: "1.88", color: "#1C2533" }}>
                    Content coming soon.
                  </p>
                )}
              </div>

              {/* Bottom CTA */}
              <div
                className="rounded-2xl border border-[#E5E9F0] bg-white p-7 flex flex-col sm:flex-row sm:items-center gap-5"
                style={{ boxShadow: "0 1px 3px rgba(15,30,51,0.05), 0 6px 16px rgba(15,30,51,0.04)" }}
              >
                <div className="flex-1">
                  <p className="font-display font-bold text-[1.1rem] text-[#0F172A] mb-1.5 tracking-[-0.015em]">
                    Try Saaksh free
                  </p>
                  <p className="text-[14px] leading-relaxed text-[#5B6573]">
                    BRSR gap analysis in under 60 seconds. No login, no data leaves your browser.
                  </p>
                </div>
                <Link
                  href="/start"
                  className="shrink-0 inline-flex items-center gap-2 bg-[#0B6FD4] hover:bg-[#0B5FB0] text-white text-[14px] font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150"
                >
                  Start a free report
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          </div>

          {/* More from the blog */}
          {related.length > 0 && (
            <section className="mt-16 pt-12 border-t border-[#E5E9F0]">
              <h2
                className="text-[#0F172A] tracking-[-0.01em] mb-6"
                style={{ ...SERIF, fontWeight: 600, fontSize: "1.5rem" }}
              >
                More from the blog
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((p) => <RelatedCard key={p.slug} post={p} />)}
              </div>
            </section>
          )}
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
