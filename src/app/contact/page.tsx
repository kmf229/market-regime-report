export default function ContactPage() {
  return (
    <div>
      {/* Contact Content */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Contact
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              For inquiries about the strategy or managed accounts, reach out below.
            </p>
            <a
              href="mailto:marketregimereport@gmail.com"
              className="inline-flex items-center gap-2 text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              marketregimereport@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> Market Regime Capital is for
            informational and educational purposes only. The content provided
            does not constitute investment advice, financial advice, or a
            recommendation to buy or sell any securities. Past performance is
            not indicative of future results. I am not a registered investment
            advisor, broker, or financial planner. Always conduct your own
            research and consult with a qualified financial professional before
            making investment decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "Contact | Market Regime Capital",
  description:
    "For inquiries about the strategy or managed accounts, reach out via email.",
};
