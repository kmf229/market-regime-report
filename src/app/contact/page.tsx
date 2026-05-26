export default function ContactPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Get in Touch
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl">
            Have questions about the strategy, feedback on the site, or want to
            discuss systematic investing? I'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email Me
              </h2>
              <p className="text-gray-600 mb-6">
                I respond to all emails personally. Whether you have a question
                about the regime model, want to share feedback, or just want to
                connect, feel free to reach out.
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

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                What I Can Help With
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Questions about the regime methodology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Technical issues with accessing content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Feedback on the newsletter or website</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>General discussion about systematic investing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> The Market Regime Report is for
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
  title: "Contact | The Market Regime Report",
  description:
    "Get in touch with questions about the regime strategy, feedback, or general discussion about systematic investing.",
};
