// ─────────────────────────────────────────────────────────────────────────
// ALL editable content for this landing page lives in this one file.
// To change a photo: drop the new file in /public/assets/photos/landing/
// and update the path here. Keep landing photos in that folder only — never
// point at a main-site folder, or a main-site change could break this page.
// To change any text: edit the strings below. Never edit the components.
// ─────────────────────────────────────────────────────────────────────────

export const content = {
  // Browser tab + ad-platform preview
  meta: {
    title: "Luxury Destination Wedding Planner in India | Vows & Vedas",
    description:
      "Plan your dream destination wedding with Vows & Vedas. Expert planners for palace, beach, hill, and luxury weddings across India's top destinations. Get a free consultation.",
  },

  hero: {
    eyebrow: "Luxury Destination Weddings · India",
    title: "Where Every Vow",
    titleAccent: "Becomes a Story",
    subtitle:
      "Plan your dream wedding in Udaipur, Goa, Jaipur, Kerala & more with India's trusted luxury wedding planners.",
    // Checkmark trust cues shown under the headline
    trustBadges: ["25+ Wedding Destinations", "End-to-End Planning", "Free Venue Consultation", "Luxury Wedding Experts"],
    // Headline numbers — big and confident, never congested
    stats: [
      { value: "15+", label: "Years Experience" },
      { value: "100+", label: "Venue Partners" },
      { value: "500+", label: "Weddings Planned" },
    ],
    // focal = where the faces are ("x% y%") so phones crop around them;
    // focalDesktop for the wide crop. Tune per photo if you swap images.
    slides: [
      { image: "/assets/photos/landing/couple shots/0G4A5379.jpg", alt: "Couple at their destination wedding celebration", focal: "30% 38%", focalDesktop: "50% 35%" },
      { image: "/assets/photos/landing/couple shots/TSR53178.jpg", alt: "Wedding couple portrait", focal: "50% 42%", focalDesktop: "50% 45%" },
      { image: "/assets/photos/landing/couple shots/TSR53127.jpg", alt: "Couple during their wedding ceremony", focal: "50% 40%", focalDesktop: "50% 40%" },
      { image: "/assets/photos/landing/couple shots/TSR53067.jpg", alt: "Newlyweds at their destination wedding", focal: "42% 28%", focalDesktop: "50% 35%" },
    ],
  },

  enquiry: {
    heading: "Begin your story",
    subheading: "Share a few details and our planners will be in touch.",
  },

  services: {
    eyebrow: "What we take care of",
    title: "Our services,",
    titleAccent: "end to end",
    items: [
      {
        name: "Venues & Destinations",
        tagline: "Every setting handpicked — scouted, negotiated, planned",
        image: "/assets/photos/landing/services/destinations-service.JPG",
        description:
          "From an intimate hilltop ceremony to coordinating guests across three days at a palace — we scout, negotiate and plan every spatial detail so you never have to.",
        includes: ["Global Footprint & Local Expertise", "Location Scouting", "Contracting & Negotiation", "Feasibility & Spatial Planning"],
      },
      {
        name: "Planning",
        tagline: "From first consultation to the final dance",
        image: "/assets/photos/landing/services/planning-service.jpg",
        description:
          "Our dedicated team pays meticulous attention to every detail, orchestrating a flawless journey from the first consultation to the final dance.",
        includes: ["End to End Timeline Mapping", "Budget Architecture & Allocation", "Curated Vendor Matchmaking", "Multi Day Itinerary Design", "On Site Command & Execution"],
      },
      {
        name: "Design & Decor",
        tagline: "Immersive environments that reflect your story",
        image: "/assets/photos/landing/services/Designa nd decor 1.jpg",
        description:
          "Every mandap, every centerpiece, every lighting rig is designed to reflect you. We build immersive environments, not just decorations.",
        includes: ["Bespoke Conceptualizing & Mood Boards", "Immersive Floral Artistry", "Custom Scenography & Production", "Strategic Lighting & Soundscaping", "Finer Details & Table Scaping"],
      },
      {
        name: "Film & Photography",
        tagline: "Cinematic storytelling, editorial craft",
        image: "/assets/photos/landing/couple-shots/TSR53178.jpg",
        description:
          "We work with India's finest wedding photographers and cinematographers to capture your story the way it deserves to be told.",
        includes: ["Editorial & Cinematic Matchmaking", "Creative Briefing & Art Direction", "Shot Listing & Logistics Planning", "BTS & Real Time Content", "Post Production & Archive Management"],
      },
      {
        name: "Entertainment",
        tagline: "Concert-grade production, curated talent",
        image: "/assets/photos/landing/services/entertainment/performances.jpg",
        description:
          "From classical Rajasthani folk performers to Bollywood DJs — we curate entertainment that fills every moment with energy and meaning.",
        includes: ["Curated Artist & Talent Sourcing", "Immersive Guest Experiences", "Sangeet Choreography & Show Direction", "Concert Grade Tech & Sound Design"],
      },
      {
        name: "Hospitality",
        tagline: "White-glove guest care, arrival to departure",
        image: "/assets/photos/landing/services/hospitality_service.jpeg",
        description:
          "Every guest at your wedding is our responsibility. From airport transfers to room upgrades — we ensure everyone feels taken care of.",
        includes: ["Dedicated RSVP Team", "Bespoke Welcome Experiences", "Ground Travel & Logistics", "24/7 Concierge & Helpdesk Support", "VVIP Management"],
      },
    ],
  },

  destinations: {
    eyebrow: "Where couples say yes",
    title: "Extraordinary",
    titleAccent: "locations",
    midCta: "Check Available Venues",
    items: [
      {
        name: "Royal & Heritage",
        places: "Udaipur · Jaipur · Jodhpur · Jaisalmer · Ranthambore",
        image: "/assets/photos/landing/destination/TSR50334.jpg",
        description:
          "Centuries-old forts and palaces where Rajputana architecture meets modern luxury — courtyards for the pheras, ramparts for the sangeet, and a skyline of domes and turrets behind every photograph. Rajasthan's royal circuit is the definitive destination-wedding stage.",
        venues: [
          { name: "The Leela Palace", location: "Jaipur", image: "/assets/photos/landing/royal-and-heritage/leela palace-jaipur.jpg" },
          { name: "Alila Fort", location: "Bishangarh", image: "/assets/photos/landing/royal-and-heritage/alila_fort.jpg" },
          { name: "Suryagarh", location: "Jaisalmer", image: "/assets/photos/landing/royal-and-heritage/suryagarh_jailasmer.jpg" },
          { name: "Six Senses", location: "Ranthambore", image: "/assets/photos/landing/royal-and-heritage/six senses_ranthambore.jpg" },
        ],
      },
      {
        name: "Beach & Backwaters",
        places: "Goa · Kovalam · Varkala · Alleppey · Andamans",
        image: "/assets/photos/landing/destination/beach-wedding-img.jpg",
        description:
          "Barefoot ceremonies at sunset, mandaps at the ocean's edge and receptions under string lights and palms — from Goa's golden sands to Kerala's quiet backwaters, coastal India makes a wedding feel like a holiday your guests never want to end.",
        venues: [
          { name: "Taj Exotica", location: "Goa", image: "/assets/photos/landing/beach-wedding/taj-exortica-goa.jpg" },
          { name: "The St. Regis", location: "Goa", image: "/assets/photos/landing/beach-wedding/st regis goa.jpeg" },
          { name: "The Leela", location: "Kovalam", image: "/assets/photos/landing/beach-wedding/The-Leela-Palace-Trail-kovalam.jpg" },
          { name: "Taj Green Cove", location: "Kerala", image: "/assets/photos/landing/beach-wedding/taj-green-cove-kerala.jpg" },
        ],
      },
      {
        name: "Hills",
        places: "Mussoorie · Shimla · Manali · Nainital · Coorg",
        image: "/assets/photos/landing/destination/hills-image.jpg",
        description:
          "Crisp mountain air, pine forests and valley views that need no décor — hill weddings trade grandeur for intimacy, with ceremonies on Himalayan lawns and evenings around firelit gatherings under the clearest skies in India.",
        venues: [
          { name: "The Westin Himalayas", location: "Uttarakhand", image: "/assets/photos/landing/hill-weddings/westin-himalayas-uttarakhand.jpeg" },
          { name: "Taj Corbett", location: "Uttarakhand", image: "/assets/photos/landing/hill-weddings/taj-corbett-uttarakhand.jpg" },
          { name: "The Lalit", location: "Srinagar", image: "/assets/photos/landing/hill-weddings/the lalit srinagar.jpg" },
          { name: "Hyatt Regency", location: "Dehradun", image: "/assets/photos/landing/hill-weddings/hyatt-dehradun.jpeg" },
        ],
      },
      {
        name: "Cities & Skylines",
        places: "Mumbai · Delhi · Bangalore · Hyderabad · Kolkata",
        image: "/assets/photos/landing/destination/cities-wedding.jpg",
        description:
          "Iconic ballrooms, rooftop receptions and five-star ease for guests flying in from everywhere — metropolitan weddings pair world-class hospitality with the energy of India's great cities, no travel logistics required.",
        venues: [
          { name: "The Leela Palace", location: "New Delhi", image: "/assets/photos/landing/citiy luxe/The-Leela-Palace-New-Delhi.jpg" },
          { name: "The Taj Mahal Palace", location: "Mumbai", image: "/assets/photos/landing/citiy luxe/taj-mumbai.jpg" },
          { name: "ITC Grand Bharat", location: "Delhi NCR", image: "/assets/photos/landing/citiy luxe/ITC-grand-bharat-delhi.jpg" },
          { name: "Taj West End", location: "Bangalore", image: "/assets/photos/landing/citiy luxe/taj-westend-banglore.jpg" },
        ],
      },
      {
        name: "International",
        places: "Thailand · Bali · Italy · UAE · Turkey",
        image: "/assets/photos/landing/destination/pool_venue.jpg",
        description:
          "Say your vows beyond India's borders — Tuscan villas and Lake Como shores, Thai beach resorts, Balinese clifftop pavilions and Emirati palaces. We handle visas and local licences, on-ground vendor sourcing and multi-country guest travel end to end, so a wedding abroad feels every bit as effortless as one at home.",
        venues: [
          { name: "Anantara", location: "Koh Samui, Thailand", image: "/assets/photos/landing/international/anantara-koh-samui.jpg" },
          { name: "AYANA Resort", location: "Bali, Indonesia", image: "/assets/photos/landing/international/ayana-bali.jpg" },
          { name: "Belmond Villa", location: "Lake Como, Italy", image: "/assets/photos/landing/international/belmond-lake-como.jpg" },
          { name: "Emirates Palace", location: "Abu Dhabi, UAE", image: "/assets/photos/landing/international/emirates-palace-abu-dhabi.jpg" },
        ],
      },
    ],
  },

  testimonials: {
    eyebrow: "Love stories",
    title: "What our",
    titleAccent: "couples say",
    featured: [
      {
        author: "Sanja & Alexander",
        location: "Goa, India",
        image: "/assets/photos/landing/sanja and alexder testimonial.jpg",
        preview:
          "The wedding was a special and one of a kind event. Like a dream or a fairytale. We both remember it with love.",
        full: "The wedding was a special and one of a kind event. Like a dream or a fairytale. We both remember it with love. My funny anecdote regarding the wedding: I am so happy I do not have to wear shoes at my wedding.\n\nWe were generally very happy to have such a special event so carefully planned with every little detail in place, without much fuss or time-consuming preparations. Your agency did a wonderful job, planned everything in consultation with us, you have really made our dream come true.",
      },
      {
        author: "Manya & Siddhant",
        location: "Alila Fort Bishangarh, India",
        image: "/assets/photos/landing/couple shots/0G4A5379.jpg",
        preview:
          "Choosing this team to plan our wedding was hands-down the best decision we made. We had a gorgeous two-day celebration at Alila Fort Bishangarh, spanning four events.",
        full: "Choosing this team to plan our wedding was hands-down the best decision we made. We had a gorgeous two-day celebration at Alila Fort Bishangarh, spanning four events—from a vibrant Mehendi and high-energy Sangeet to an intimate Haldi and our dream Wedding.\n\nWhat truly set them apart was their incredible resilience and professionalism. When sudden rain threatened to disrupt our outdoor plans on both days, the team didn't miss a beat. They executed backup plans flawlessly, managing the logistics so seamlessly that our guests never even noticed the hiccups. Siddhant and I were able to completely immerse ourselves in our celebrations, knowing we were in the safest hands. If you want a team that can handle any curveball with grace and deliver perfection, look no further!",
      },
    ],
    quotes: [
      {
        quote: "Vows & Vedas turned our dream of a Rajasthan palace wedding into a breathtaking reality. Everything you have done for us is more like what we expect a family member to do.",
        author: "Zara & Samar",
        location: "Udaipur Palace, India",
      },
      {
        quote: "Our wedding at the Devi Garh was an unforgettable experience. The hotel was absolutely stunning and the level of service was outstanding.",
        author: "Sonia & Manlio",
        location: "Devi Garh, Rajasthan",
      },
      {
        quote: "The entire wedding and organization was truly amazing! Our dream is to go back to Symphony Beach once again. We will recommend you everywhere we can.",
        author: "Tivadar & Orsi",
        location: "Symphony Beach, Goa",
      },
      {
        quote: "The wedding was spectacular and everything I dreamed and more. Thank you and your team from the bottom of my heart for making my renewal of vows so magical and special.",
        author: "Cheryl & Sanjay",
        location: "Rajasthan",
      },
      {
        quote: "We were really impressed that we managed to organize the entire three-day ceremony from so far away, in such detail. From the painstaking planning to the wonderful memories, the wedding was exceptional.",
        author: "Emma & James",
        location: "Goa, India",
      },
    ],
  },

  gallery: {
    eyebrow: "From real weddings",
    title: "Moments",
    titleAccent: "we've made",
    images: [
      { image: "/assets/photos/landing/couple-shots/TSR53040.jpg", alt: "Wedding celebration moment" },
      { image: "/assets/photos/landing/couple-shots/TSR53127.jpg", alt: "Couple portrait at their wedding" },
      { image: "/assets/photos/landing/couple-shots/0G4A4811.jpg", alt: "Wedding ceremony detail" },
      { image: "/assets/photos/landing/couple-shots/0G4A1676.jpg", alt: "Celebration at a destination wedding" },
      { image: "/assets/photos/landing/couple-shots/0G4A4625.jpg", alt: "Wedding festivities" },
      { image: "/assets/photos/landing/couple-shots/TSR53717.jpg", alt: "Couple at sunset" },
    ],
  },

  faq: {
    eyebrow: "Good to know",
    title: "Frequently asked",
    titleAccent: "questions",
    items: [
      {
        q: "What makes Vows & Vedas different from other wedding planners?",
        a: "We combine deep cultural knowledge with an international design sensibility — and we treat each wedding as a one-of-a-kind story. Every detail is intentional, every vendor is trusted, and every couple feels genuinely cared for from the first call to the final farewell.",
      },
      {
        q: "How early should we book?",
        a: "For destination weddings, we recommend booking 12–18 months in advance to secure your ideal venue and dates. For local weddings, 6–12 months is usually sufficient. That said, we occasionally accommodate shorter timelines — reach out and we'll see what's possible.",
      },
      {
        q: "Do you plan international weddings?",
        a: "Yes, we do. Alongside our destinations across India, we plan and orchestrate weddings around the world — European palaces, Middle Eastern resorts, island ceremonies and beyond. We handle cross-border logistics, local vendor sourcing and guest coordination end to end, so distance never gets in the way of the celebration.",
      },
      {
        q: "What's included in your planning packages?",
        a: "Both our Full Planning and Full Luxury / Destination Planning packages include end-to-end support from scratch:",
        bullets: [
          "Venue sourcing and selection",
          "All vendor negotiations",
          "Contract management",
          "Detailed design conceptualisation",
          "Guest management support",
          "Multiple planning meetings",
          "Site visits",
          "Post-wedding vendor settlements",
        ],
        note: "For the Luxury & Destination package, all inclusions remain the same — what changes is the scale of execution, the level of detailing, personalisation, and the ratio of our team to your guests.",
      },
    ],
    cta: {
      eyebrow: "Still have a question?",
      button: "Ask Our Planners",
    },
  },

  finalCta: {
    eyebrow: "Your destination awaits",
    title: "Can't decide?",
    titleAccent: "We'll help you choose.",
    subtitle:
      "Tell us your vibe, your guest count, your season — and we'll curate the perfect destination for your story.",
    button: "Get Free Wedding Consultation",
  },
};
