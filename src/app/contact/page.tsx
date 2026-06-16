import ContactForm from "@/components/ContactForm";
import Disclaimer from "@/components/Disclaimer";

export default function ContactPage() {
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
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl">
            Interested in learning more? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Contact Form */}
            <div>
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
                Get in Touch
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send a Message
              </h2>
              <ContactForm />
            </div>

            {/* Right: What to Expect */}
            <div>
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-3">
                Response Details
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What to Expect
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Response Time
                  </h3>
                  <p className="text-gray-600">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    What to Expect
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>
                        We&apos;ll review your inquiry and respond within 24 hours
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>
                        Qualified investors interested in future investment availability
                        will receive information when the program launches
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>
                        All inquiries are treated with strict confidentiality
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Notice */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3">
              Future Investment Availability
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              The investment program will be available only to accredited investors as
              defined by the SEC. Generally, this includes individuals with net worth
              exceeding $1 million (excluding primary residence) or annual income exceeding
              $200,000 ($300,000 joint income) for the past two years. Market Regime Capital
              is currently building a track record in preparation for CTA registration.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Disclaimer variant="standard" />
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: "Contact",
  description:
    "Contact Market Regime Capital to learn about systematic futures management programs for qualified investors.",
};
