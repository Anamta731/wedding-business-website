"use client";

import Image from "next/image";
import { SectionHeading, Reveal } from "./LandingSection";
import { PhotoFrame } from "./Ornaments";

export default function LandingGallery({ eyebrow, title, titleAccent, images }) {
  return (
    <section className="bg-bg py-12 md:py-16 px-5 sm:px-8">
      <div className="max-w-[1160px] mx-auto">
        <SectionHeading eyebrow={eyebrow} title={title} titleAccent={titleAccent} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {images.map((img, i) => (
            <Reveal key={img.image} delay={(i % 3) * 0.06}>
              <div className="group relative aspect-square overflow-hidden rounded-[3px]">
                <Image
                  src={img.image}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <PhotoFrame />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
