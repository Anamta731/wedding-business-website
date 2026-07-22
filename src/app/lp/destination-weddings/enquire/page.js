import LandingContactPage from "@/components/landing/LandingContactPage";

export const metadata = {
  title: "Enquire — Vows & Vedas",
  description: "Tell us about your dream day and our planners will be in touch.",
  // Campaign page: kept out of Google like the landing page itself.
  robots: { index: false, follow: false },
};

export default function DestinationWeddingsEnquire() {
  return <LandingContactPage backHref="/lp/destination-weddings" thankYouHref="/lp/destination-weddings/thank-you" />;
}
