import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Vows & Vedas",
  description:
    "How Vows & Vedas collects, uses, and protects your personal data in line with India's Digital Personal Data Protection Act, 2023.",
  robots: { index: true, follow: true },
};

// Static Server Component — the approved DPDP policy text, published verbatim (§1–§14).
// Do not paraphrase or summarise this content.
export default function PrivacyPolicyPage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* HEADER BAND */}
      <header className="bg-ink pt-40 pb-20 px-6 text-center">
        <p className="font-body font-medium uppercase text-gold text-[10px] tracking-[0.5em] mb-5">
          Your Privacy
        </p>
        <h1 className="font-heading font-light text-surface leading-[1.05] text-[clamp(40px,6vw,72px)]">
          Privacy <em className="italic">Policy</em>
        </h1>
        <p className="text-surface/50 text-[12px] tracking-[0.15em] uppercase mt-6">
          Effective date: July 2026 · Last updated: July 2026
        </p>
      </header>

      {/* POLICY BODY */}
      <article className="max-w-[820px] mx-auto px-6 md:px-8 py-20 md:py-24">
        <p className="policy-lead text-[19px] md:text-[22px] leading-[1.7] font-light font-heading italic text-ink/80 mb-8">
          Vows &amp; Vedas (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) respects your
          privacy and is committed to protecting the personal information you share with us. This
          policy explains what we collect through vowsandvedas.com, why we collect it, and the
          choices and rights you have, in line with India&rsquo;s Digital Personal Data Protection
          Act, 2023 (&ldquo;DPDP Act&rdquo;).
        </p>
        <p className="policy-p">
          Vows &amp; Vedas does not sell any products or services through this website. We do not
          process payments or bookings online. This policy covers only the information we collect
          when you enquire with us, chat with our AI assistant, or create an account.
        </p>

        <section id="who-we-are" className="policy-section">
          <h2 className="policy-h2">1. Who we are</h2>
          <p className="policy-p">
            Vows &amp; Vedas is a wedding planning brand operated by MCI GETS INDIA PVT LTD and
            registered address: Golf View Tower, 6th Floor, Tower &ndash; B, Sector 42, Gurugram,
            Haryana 122009, India. For any questions about this policy or your personal data, you
            can reach us at{" "}
            <a href="mailto:info@vowsandvedas.com" className="policy-link">
              info@vowsandvedas.com
            </a>
            .
          </p>
        </section>

        <section id="information-we-collect" className="policy-section">
          <h2 className="policy-h2">2. What information we collect</h2>
          <p className="policy-p">
            <strong className="policy-strong">a) Enquiry form</strong> &mdash; When you fill out our
            enquiry form, we collect your name, email address, phone number, wedding destination,
            wedding date, and the message you send us. This information is passed to our sales team
            so they can respond to your enquiry. Our enquiry form uses Google reCAPTCHA to protect
            against spam; Google&rsquo;s privacy policy applies to that check.
          </p>
          <p className="policy-p">
            <strong className="policy-strong">b) AI chat assistant</strong> &mdash; Our website
            includes an AI-powered chat assistant to help you plan your wedding. When you use it, we
            collect the conversation itself, along with any details you choose to share &mdash; such
            as your preferred city or destination, wedding dates, guest count, budget, and other
            preferences.
          </p>
          <p className="policy-p">
            The assistant&rsquo;s replies are generated using a third-party AI service provided by
            Microsoft. Your conversation is processed by this service in order to generate a
            response.
          </p>
          <p className="policy-p">
            Lead details from your chat are currently shared with our sales team by email. We are in
            the process of also saving full chat conversations within our own systems, so our team
            can follow up on your enquiry more effectively. We will only begin storing full
            conversations after this policy takes effect, and by using the chat assistant after that
            date, you consent to this storage as described here.
          </p>
          <p className="policy-p">
            <strong className="policy-strong">c) Optional account registration</strong> &mdash; If
            you choose to create an account using your email address, we store your saved wedding
            ideas and a record of your enquiries so you can view them when you sign in.
          </p>
          <p className="policy-p">
            <strong className="policy-strong">d) Newsletter</strong> &mdash; If you sign up for our
            newsletter, we collect your email address to send you wedding inspiration, offers, and
            updates from Vows &amp; Vedas. You can unsubscribe at any time using the link in any
            newsletter email or by writing to{" "}
            <a href="mailto:info@vowsandvedas.com" className="policy-link">
              info@vowsandvedas.com
            </a>
            .
          </p>
          <p className="policy-p">
            <strong className="policy-strong">e) Cookies and usage data</strong> &mdash; We use
            cookies to keep you signed in if you create an account. We also collect usage statistics
            (such as which pages are viewed) through our own analytics and through third-party
            cookies and marketing trackers, managed via Google Tag Manager. These help us understand
            how visitors use the site, measure the performance of our advertising campaigns, and show
            you relevant ads (see Cookies, below).
          </p>
        </section>

        <section id="why-we-collect" className="policy-section">
          <h2 className="policy-h2">3. Why we collect this information</h2>
          <p className="policy-p">We collect and use your information only to:</p>
          <ul className="policy-list">
            <li>Respond to your enquiry and help plan your wedding</li>
            <li>Operate the AI chat assistant and generate relevant responses</li>
            <li>
              Maintain your account, if you create one, and show you your saved ideas and past
              enquiries
            </li>
            <li>Keep you signed in and understand overall site usage</li>
            <li>Send you our newsletter, if you sign up for it (you can unsubscribe anytime)</li>
            <li>Meet our legal obligations</li>
          </ul>
          <p className="policy-p">
            We do not sell your personal information. Cookie-based data (not your name, email, or
            phone number) may be used, including by our advertising partners such as Google, to
            measure our ad campaigns and show you relevant ads.
          </p>
        </section>

        <section id="legal-basis" className="policy-section">
          <h2 className="policy-h2">4. Legal basis for processing</h2>
          <p className="policy-p">
            Under the DPDP Act, we process your personal data based on your consent. Where you
            provide information through the enquiry form, the chat assistant, or by creating an
            account, you are giving us consent to process that information for the purposes described
            in this policy. You may withdraw your consent at any time by contacting us at{" "}
            <a href="mailto:info@vowsandvedas.com" className="policy-link">
              info@vowsandvedas.com
            </a>
            , though this may affect our ability to respond to your enquiry or provide certain
            features.
          </p>
        </section>

        <section id="how-we-share" className="policy-section">
          <h2 className="policy-h2">5. How we share your information</h2>
          <p className="policy-p">
            We share your information only with our own team, for the purpose of responding to your
            enquiry and planning your wedding. We do not sell your personal data to anyone.
          </p>
          <p className="policy-p">
            Your chat conversations are shared with Microsoft, as our AI service provider, solely to
            generate responses within the chat assistant. Microsoft processes this data on our behalf
            and is bound by its own data processing terms with us.
          </p>
          <p className="policy-p">
            We do not otherwise share your personal data with third parties, except where required by
            law.
          </p>
        </section>

        <section id="data-retention" className="policy-section">
          <h2 className="policy-h2">6. Data retention</h2>
          <p className="policy-p">
            We retain your personal data only for as long as necessary to fulfil the purposes
            described in this policy, or as required by law. When it&rsquo;s no longer needed, we
            delete it or anonymise it so it no longer identifies you.
          </p>
        </section>

        <section id="your-rights" className="policy-section">
          <h2 className="policy-h2">7. Your rights</h2>
          <p className="policy-p">As a Data Principal under the DPDP Act, you have the right to:</p>
          <ul className="policy-list">
            <li>Access the personal data we hold about you</li>
            <li>Correct or update inaccurate or incomplete data</li>
            <li>Have your data erased, subject to any legal retention requirements</li>
            <li>Withdraw your consent at any time</li>
            <li>
              Nominate another individual to exercise these rights on your behalf in the event of
              your death or incapacity
            </li>
            <li>Raise a grievance with us regarding how we handle your data</li>
          </ul>
          <p className="policy-p">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:info@vowsandvedas.com" className="policy-link">
              info@vowsandvedas.com
            </a>
            . If you&rsquo;re not satisfied with our response, you may approach the Data Protection
            Board of India.
          </p>
        </section>

        <section id="grievance-officer" className="policy-section">
          <h2 className="policy-h2">8. Grievance Officer</h2>
          <p className="policy-p">
            In accordance with the DPDP Act, our Grievance Officer can be reached at: Rakesh Bijewar
            at{" "}
            <a href="mailto:info@vowsandvedas.com" className="policy-link">
              info@vowsandvedas.com
            </a>
            .
          </p>
        </section>

        <section id="security" className="policy-section">
          <h2 className="policy-h2">9. Security</h2>
          <p className="policy-p">
            We take reasonable technical and organizational measures to protect your personal data
            against unauthorized access, loss, or misuse. Your data is stored on Microsoft Azure
            servers, which may be located outside India; it remains protected as described in this
            policy wherever it is stored.
          </p>
        </section>

        <section id="cookies" className="policy-section">
          <h2 className="policy-h2">10. Cookies</h2>
          <p className="policy-p">
            We use essential cookies (to keep you signed in), analytics cookies to understand site
            usage, and advertising cookies. Advertising cookies &mdash; set by third parties such as
            Google through Google Tag Manager &mdash; are used to measure the effectiveness of our ad
            campaigns and to show you relevant ads on other websites (remarketing). These cookies do
            not contain your name or contact details. You can manage or disable cookies through your
            browser settings, or opt out of personalised Google ads at adssettings.google.com, though
            this may affect some site features.
          </p>
        </section>

        <section id="childrens-data" className="policy-section">
          <h2 className="policy-h2">11. Children&rsquo;s data</h2>
          <p className="policy-p">
            Our website and services are not directed at children, and we do not knowingly collect
            personal data from anyone under the age of 18.
          </p>
        </section>

        <section id="visitors-outside-india" className="policy-section">
          <h2 className="policy-h2">12. Visitors outside India</h2>
          <p className="policy-p">
            Our services are provided from India and this policy is governed by Indian law, including
            the DPDP Act. If you contact us from outside India, your information will be transferred
            to and handled in India (and on Microsoft&rsquo;s servers, which may be located in other
            countries) as described in this policy.
          </p>
          <p className="policy-p">
            Wherever you are located, we extend you the same choices and rights described in this
            policy &mdash; including access, correction, and deletion of your data, and withdrawal of
            consent &mdash; via{" "}
            <a href="mailto:info@vowsandvedas.com" className="policy-link">
              info@vowsandvedas.com
            </a>
            . If the privacy laws of your country grant you additional rights, we will honour
            reasonable requests made under them to the extent we are able.
          </p>
        </section>

        <section id="changes" className="policy-section">
          <h2 className="policy-h2">13. Changes to this policy</h2>
          <p className="policy-p">
            We may update this Privacy Policy from time to time, particularly as our AI chat
            assistant&rsquo;s data handling evolves. We&rsquo;ll post the updated version here with a
            revised &ldquo;last updated&rdquo; date. If changes are significant, we&rsquo;ll take
            reasonable steps to notify you.
          </p>
        </section>

        <section id="contact" className="policy-section">
          <h2 className="policy-h2">14. Contact us</h2>
          <p className="policy-p">
            If you have any questions about this policy or how we handle your data, please reach out
            to us at{" "}
            <a href="mailto:info@vowsandvedas.com" className="policy-link">
              info@vowsandvedas.com
            </a>
            .
          </p>
        </section>

        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/" className="policy-link text-[13px] tracking-[0.1em] uppercase">
            ← Back to Vows &amp; Vedas
          </Link>
        </div>
      </article>
    </div>
  );
}
