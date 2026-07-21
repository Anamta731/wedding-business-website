import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import EnquiryForm from "@/components/landing/EnquiryForm";
import LandingServices from "@/components/landing/LandingServices";
import LandingDestinations from "@/components/landing/LandingDestinations";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingGallery from "@/components/landing/LandingGallery";
import LandingFaq from "@/components/landing/LandingFaq";
import LandingFinalCta from "@/components/landing/LandingFinalCta";
import LandingFooter from "@/components/landing/LandingFooter";
import StickyCtaBar from "@/components/landing/StickyCtaBar";
import FloatingCtaRail from "@/components/landing/FloatingCtaRail";
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
      <LandingHeader enquireHref="/lp/destination-weddings/enquire" />

      <LandingHero {...content.hero}>
        <EnquiryForm {...content.enquiry} />
      </LandingHero>

      <LandingServices {...content.services} />
      <LandingDestinations {...content.destinations} enquireHref="/lp/destination-weddings/enquire" />
      <LandingTestimonials {...content.testimonials} />
      <LandingGallery {...content.gallery} />
      <LandingFaq {...content.faq} enquireHref="/lp/destination-weddings/enquire" />
      <LandingFinalCta {...content.finalCta} enquireHref="/lp/destination-weddings/enquire" />

      <LandingFooter />
      <StickyCtaBar enquireHref="/lp/destination-weddings/enquire" />
      <FloatingCtaRail enquireHref="/lp/destination-weddings/enquire" />
    </div>
  );
}
