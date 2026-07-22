import Link from "next/link";

export const metadata = {
  title: "Thank You — Vows & Vedas",
  description: "Thank you for your enquiry. We'll be in touch shortly.",
  // Campaign page: kept out of Google like the landing page itself, and so
  // its distinct URL can be used to attribute conversions to the campaign.
  robots: { index: false, follow: false },
};

export default function DestinationWeddingsThankYou() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] tracking-[0.5em] uppercase font-medium mb-6" style={{ color: 'var(--color-gold)' }}>
        Enquiry Received
      </p>
      <h1 className="font-heading text-surface font-light text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6">
        Thank You for<br /><em className="italic">Reaching Out</em>
      </h1>
      <div className="h-px w-16 mb-6" style={{ background: 'rgba(201,162,52,0.4)' }}></div>
      <p className="font-body font-light text-surface/60 text-sm sm:text-base leading-[1.8] max-w-md mb-10">
        We've received your enquiry and will be in touch within 24–48 hours to begin planning your dream destination wedding.
      </p>
      <Link href="/lp/destination-weddings" className="btn-gold">
        <span>Back to Landing Page</span>
      </Link>
    </div>
  );
}
