import Link from "next/link";
import { getAllPublishedArticles } from "@/lib/articles";
import Disclaimer from "@/components/Disclaimer";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function HomePage() {
  const recentArticles = getAllPublishedArticles().slice(0, 3);
  return (
    <div>
      {/* Hero Section */}
      <section className="relative border-b border-gray-200">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/70"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-4">
              Systematic Investment Strategy
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Systematic Futures Management.
              <br />
              Institutional Discipline.
            </h1>
            <p className="mt-6 text-xl text-gray-700 leading-relaxed">
              A quantitative CTA strategy for qualified investors. Our systematic framework
              rotates between equity index futures and alternative assets based on observed
              market leadership patterns, delivering consistent execution without discretionary risk.
            </p>
            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900">The Edge</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              We exploit institutional capital rotation—the measurable, slow-moving shift of large
              capital pools between risk-on sectors (technology, industrials, discretionary) and
              risk-off havens (utilities, staples, gold, treasuries). When a pension fund managing
              $50 billion repositions, it takes weeks to months. That creates persistent, measurable
              drift in relative sector strength.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Our framework detects this rotation while it's happening—not by predicting it, but by
              measuring the herd's footprint through quantitative analysis of market leadership patterns.
              The edge persists because institutional size creates lag, career risk ensures coordinated
              behavior, and the risk-on/risk-off dynamic is fundamental to how markets price risk.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Unlike diversified CTAs trading 50-100 markets, we make one high-conviction macro decision—risk-on
              or risk-off—and express it through concentrated futures positions. The result: transparency,
              simplicity, and robustness confirmed across thousands of parameter variations.
            </p>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            What Sets Us Apart
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Systematic Process
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every decision follows a repeatable, rules-based framework with
                complete transparency. No discretionary overrides, no subjective
                interpretation, no principal-agent risk.
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Full Transparency
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Actual executed trades documented in real-time with complete auditability.
                Track record includes time-weighted returns, trade-level detail, and daily
                updates—unusual disclosure for a pre-registration manager.
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Aligned Incentives
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Performance-based fee structure with complete alignment of interests.
                Compensation tied directly to realized returns, ensuring focus on
                long-term capital appreciation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Track Record Preview */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Track Record
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              View our complete track record including monthly returns, equity curve,
              and performance metrics. Full transparency with detailed trade history
              and risk-adjusted returns.
            </p>
            <div className="mt-8">
              <Link
                href="/track-record"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Track Record
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Insights Section */}
      {recentArticles.length > 0 && (
        <section className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Latest Insights
              </h2>
              <Link
                href="/insights"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="group"
                >
                  <div className="aspect-[16/9] relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {formatDate(article.date)}
                  </p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Disclaimer variant="standard" />
        </div>
      </section>
    </div>
  );
}
