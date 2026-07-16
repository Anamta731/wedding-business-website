import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-surface/60 py-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div>
          <p className="font-heading text-2xl text-surface tracking-[0.1em] mb-4">Vows & Vedas</p>
          <p className="text-[12px] leading-relaxed font-light">
            India's premier luxury destination wedding studio. We craft timeless ceremonies that become the story you tell forever.
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-medium mb-5">Navigate</p>
          <ul className="flex flex-col gap-3">
            {[
              { name: 'Services', href: '/services' },
              { name: 'Weddings', href: '/portfolio' },
              { name: 'About', href: '/about' },
              { name: 'Destinations', href: '/destinations' },
              { name: 'FAQ', href: '/faq' },
              { name: 'Contact', href: '/contact' }
            ].map(item => (
              <li key={item.name}>
                <Link href={item.href} className="text-[12px] text-surface/55 hover:text-gold transition-colors font-light">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-medium mb-5">Offerings</p>
          <ul className="flex flex-col gap-3">
            {[
              { name: 'Destination Weddings', href: '/services#venues-destinations' },
              { name: 'Full Planning',        href: '/services#planning' },
              { name: 'Décor & Florals',      href: '/services#design-decor' },
              { name: 'Photography',          href: '/services#film-photography' },
              { name: 'Hospitality',          href: '/services#hospitality' },
              { name: 'Travel',               href: '/services#travel-logistics' },
            ].map(item => (
              <li key={item.name}>
                <Link href={item.href} className="text-[12px] text-surface/55 hover:text-gold transition-colors font-light">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-medium mb-5">Stay Connected</p>
          <p className="text-[12px] font-light mb-4 text-surface/50">Receive inspiration, stories & exclusive offers.</p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-surface/5 border-none border-b border-surface/20 p-3 text-[12px] text-surface outline-none focus:border-gold transition-colors w-full"
            />
            <button className="bg-gold px-4 text-surface transition-opacity hover:opacity-90">
              →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto border-t border-surface/10 pt-7 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest gap-6">
        <p>© 2026 Vows & Vedas. All rights reserved.</p>
        <div className="flex gap-5 uppercase">
          <a href="https://www.instagram.com/vowsandvedas/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=61590644336785" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Facebook</a>
          <a href="https://in.pinterest.com/0u6w73ufbzaf9911r1d9c3nzvsvupg/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Pinterest</a>
          <a href="http://www.youtube.com/@VowsandVedas" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">YouTube</a>
          <a href="https://www.linkedin.com/company/125034077/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">LinkedIn</a>
          <a href="/contact" className="hover:text-gold transition-colors">WhatsApp</a>
        </div>
        <p className="uppercase">Privacy · Terms</p>
      </div>
    </footer>
  );
}
