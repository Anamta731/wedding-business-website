import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import EnquiryForm from "@/components/landing/EnquiryForm";
import LandingServices from "@/components/landing/LandingServices";
import LandingDestinations from "@/components/landing/LandingDestinations";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingGallery from "@/components/landing/LandingGallery";
import LandingFinalCta from "@/components/landing/LandingFinalCta";
import LandingFooter from "@/components/landing/LandingFooter";
import StickyCtaBar from "@/components/landing/StickyCtaBar";
import { content } from "./content";

export const metadata = {
  title: content.meta.title,
  description: content.meta.description,
  // Campaign page: keep it out of Google while we experiment, so it never
  // competes with the main site's pages. Remove this line to allow indexing.
  robots: { index: false, follow: false },
};

export default function DestinationWeddingsLanding() {
  return (
    <div className="bg-bg">
      <LandingHeader />

      <LandingHero {...content.hero}>
        <EnquiryForm {...content.enquiry} />
      </LandingHero>

      <LandingServices {...content.services} />
      <LandingDestinations {...content.destinations} />
      <LandingTestimonials {...content.testimonials} />
      <LandingGallery {...content.gallery} />
      <LandingFinalCta {...content.finalCta} />

      <LandingFooter />
      <StickyCtaBar />
    </div>
  );
}
