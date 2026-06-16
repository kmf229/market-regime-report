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
              A rules-based CTA approach for qualified investors. Our systematic framework
              rotates between equity index futures and alternative assets based on market
              leadership—not predictions, not gut feelings, just systematic execution.
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
            <h2 className="text-2xl font-bold text-gray-900">The Philosophy</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Most traders lose money not because of bad analysis, but because
              of bad behavior—overtrading, selling winners early, holding losers
              too long. Market Regime Capital eliminates these mistakes with
              a systematic framework that removes emotion from the equation.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              The regime model identifies whether the market favors risk-on or
              risk-off positioning, then allocates to futures accordingly. The
              approach prioritizes conviction over activity—regime shifts are
              rare by design, typically just a handful per year, reflecting only
              significant structural changes in market leadership.
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
                Every decision follows a repeatable, rules-based framework.
                No discretionary overrides, no second-guessing, no emotional
                interference.
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Full Transparency
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Complete documentation of every trade, every regime shift,
                every win and loss. The track record is fully auditable with
                time-weighted returns.
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Aligned Incentives
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Performance-based fee structure aligns our success with yours.
                We succeed when you succeed—no profit without demonstrated results.
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
