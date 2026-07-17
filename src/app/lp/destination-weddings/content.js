// ─────────────────────────────────────────────────────────────────────────
// ALL editable content for this landing page lives in this one file.
// To change a photo: drop the new file in /public/assets/photos/landing/
// (or reuse an existing site photo) and update the path here.
// To change any text: edit the strings below. Never edit the components.
// ─────────────────────────────────────────────────────────────────────────

export const content = {
  // Browser tab + ad-platform preview
  meta: {
    title: "Luxury Destination Weddings in India — Vows & Vedas",
    description:
      "Palaces, beaches, hills and havelis — planned end to end by India's premier luxury destination wedding studio. Tell us about your day.",
  },

  hero: {
    eyebrow: "Luxury Destination Weddings · India",
    title: "Marry somewhere",
    titleAccent: "extraordinary.",
    subtitle:
      "Palace courtyards, ocean-edge mandaps, Himalayan lawns — scouted, designed and orchestrated end to end, so you only have to be present.",
    placesLine: "Udaipur · Goa · Jaipur · Kerala · Jaisalmer · The Himalayas",
    // focal = where the faces are ("x% y%") so phones crop around them;
    // focalDesktop for the wide crop. Tune per photo if you swap images.
    slides: [
      { image: "/assets/photos/couple shots/0G4A5379.jpg", alt: "Couple at their destination wedding celebration", focal: "30% 38%", focalDesktop: "50% 35%" },
      { image: "/assets/photos/couple shots/TSR53178.jpg", alt: "Wedding couple portrait", focal: "50% 42%", focalDesktop: "50% 45%" },
      { image: "/assets/photos/couple shots/TSR53127.jpg", alt: "Couple during their wedding ceremony", focal: "50% 40%", focalDesktop: "50% 40%" },
      { image: "/assets/photos/couple shots/TSR53067.jpg", alt: "Newlyweds at their destination wedding", focal: "42% 28%", focalDesktop: "50% 35%" },
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
        image: "/assets/photos/services/destinations-service.JPG",
        description:
          "From an intimate hilltop ceremony to coordinating guests across three days at a palace — we scout, negotiate and plan every spatial detail so you never have to.",
        includes: ["Global Footprint & Local Expertise", "Location Scouting", "Contracting & Negotiation", "Feasibility & Spatial Planning"],
      },
      {
        name: "Planning",
        tagline: "From first consultation to the final dance",
        image: "/assets/photos/services/planning-service.jpg",
        description:
          "Our dedicated team pays meticulous attention to every detail, orchestrating a flawless journey from the first consultation to the final dance.",
        includes: ["End to End Timeline Mapping", "Budget Architecture & Allocation", "Curated Vendor Matchmaking", "Multi Day Itinerary Design", "On Site Command & Execution"],
      },
      {
        name: "Design & Decor",
        tagline: "Immersive environments that reflect your story",
        image: "/assets/photos/services/Designa nd decor 1.jpg",
        description:
          "Every mandap, every centerpiece, every lighting rig is designed to reflect you. We build immersive environments, not just decorations.",
        includes: ["Bespoke Conceptualizing & Mood Boards", "Immersive Floral Artistry", "Custom Scenography & Production", "Strategic Lighting & Soundscaping", "Finer Details & Table Scaping"],
      },
      {
        name: "Film & Photography",
        tagline: "Cinematic storytelling, editorial craft",
        image: "/assets/photos/couple-shots/TSR53178.jpg",
        description:
          "We work with India's finest wedding photographers and cinematographers to capture your story the way it deserves to be told.",
        includes: ["Editorial & Cinematic Matchmaking", "Creative Briefing & Art Direction", "Shot Listing & Logistics Planning", "BTS & Real Time Content", "Post Production & Archive Management"],
      },
      {
        name: "Entertainment",
        tagline: "Concert-grade production, curated talent",
        image: "/assets/photos/services/entertainment/performances.jpg",
        description:
          "From classical Rajasthani folk performers to Bollywood DJs — we curate entertainment that fills every moment with energy and meaning.",
        includes: ["Curated Artist & Talent Sourcing", "Immersive Guest Experiences", "Sangeet Choreography & Show Direction", "Concert Grade Tech & Sound Design"],
      },
      {
        name: "Hospitality",
        tagline: "White-glove guest care, arrival to departure",
        image: "/assets/photos/services/hospitality_service.jpeg",
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
    midCta: "Tell us your dream destination",
    items: [
      {
        name: "Royal & Heritage",
        places: "Udaipur · Jaipur · Jodhpur · Jaisalmer · Ranthambore",
        image: "/assets/photos/destination/TSR50334.jpg",
        description:
          "Centuries-old forts and palaces where Rajputana architecture meets modern luxury — courtyards for the pheras, ramparts for the sangeet, and a skyline of domes and turrets behind every photograph. Rajasthan's royal circuit is the definitive destination-wedding stage.",
        venues: [
          { name: "The Leela Palace", location: "Jaipur", image: "/assets/photos/royal-and-heritage/leela palace-jaipur.jpg" },
          { name: "Alila Fort", location: "Bishangarh", image: "/assets/photos/royal-and-heritage/alila_fort.jpg" },
          { name: "Suryagarh", location: "Jaisalmer", image: "/assets/photos/royal-and-heritage/suryagarh_jailasmer.jpg" },
          { name: "Six Senses", location: "Ranthambore", image: "/assets/photos/royal-and-heritage/six senses_ranthambore.jpg" },
        ],
      },
      {
        name: "Beach & Backwaters",
        places: "Goa · Kovalam · Varkala · Alleppey · Andamans",
        image: "/assets/photos/destination/beach-wedding-img.jpg",
        description:
          "Barefoot ceremonies at sunset, mandaps at the ocean's edge and receptions under string lights and palms — from Goa's golden sands to Kerala's quiet backwaters, coastal India makes a wedding feel like a holiday your guests never want to end.",
        venues: [
          { name: "Taj Exotica", location: "Goa", image: "/assets/photos/beach-wedding/taj-exortica-goa.jpg" },
          { name: "The St. Regis", location: "Goa", image: "/assets/photos/beach-wedding/st regis goa.jpeg" },
          { name: "The Leela", location: "Kovalam", image: "/assets/photos/beach-wedding/The-Leela-Palace-Trail-kovalam.jpg" },
          { name: "Taj Green Cove", location: "Kerala", image: "/assets/photos/beach-wedding/taj-green-cove-kerala.jpg" },
        ],
      },
      {
        name: "Hills",
        places: "Mussoorie · Shimla · Manali · Nainital · Coorg",
        image: "/assets/photos/destination/hills-image.jpg",
        description:
          "Crisp mountain air, pine forests and valley views that need no décor — hill weddings trade grandeur for intimacy, with ceremonies on Himalayan lawns and evenings around firelit gatherings under the clearest skies in India.",
        venues: [
          { name: "The Westin Himalayas", location: "Uttarakhand", image: "/assets/photos/hill-weddings/westin-himalayas-uttarakhand.jpeg" },
          { name: "Taj Corbett", location: "Uttarakhand", image: "/assets/photos/hill-weddings/taj-corbett-uttarakhand.jpg" },
          { name: "The Lalit", location: "Srinagar", image: "/assets/photos/hill-weddings/the lalit srinagar.jpg" },
          { name: "Hyatt Regency", location: "Dehradun", image: "/assets/photos/hill-weddings/hyatt-dehradun.jpeg" },
        ],
      },
      {
        name: "Cities & Skylines",
        places: "Mumbai · Delhi · Bangalore · Hyderabad · Kolkata",
        image: "/assets/photos/destination/cities-wedding.jpg",
        description:
          "Iconic ballrooms, rooftop receptions and five-star ease for guests flying in from everywhere — metropolitan weddings pair world-class hospitality with the energy of India's great cities, no travel logistics required.",
        venues: [
          { name: "The Leela Palace", location: "New Delhi", image: "/assets/photos/citiy luxe/The-Leela-Palace-New-Delhi.jpg" },
          { name: "The Taj Mahal Palace", location: "Mumbai", image: "/assets/photos/citiy luxe/taj-mumbai.jpg" },
          { name: "ITC Grand Bharat", location: "Delhi NCR", image: "/assets/photos/citiy luxe/ITC-grand-bharat-delhi.jpg" },
          { name: "Taj West End", location: "Bangalore", image: "/assets/photos/citiy luxe/taj-westend-banglore.jpg" },
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
        image: "/assets/photos/sanja and alexder testimonial.jpg",
        preview:
          "The wedding was a special and one of a kind event. Like a dream or a fairytale. We both remember it with love.",
        full: "The wedding was a special and one of a kind event. Like a dream or a fairytale. We both remember it with love. My funny anecdote regarding the wedding: I am so happy I do not have to wear shoes at my wedding.\n\nWe were generally very happy to have such a special event so carefully planned with every little detail in place, without much fuss or time-consuming preparations. Your agency did a wonderful job, planned everything in consultation with us, you have really made our dream come true.",
      },
      {
        author: "Manya & Siddhant",
        location: "Alila Fort Bishangarh, India",
        image: "/assets/photos/couple shots/0G4A5379.jpg",
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
      { image: "/assets/photos/couple-shots/TSR53040.jpg", alt: "Wedding celebration moment" },
      { image: "/assets/photos/couple-shots/TSR53127.jpg", alt: "Couple portrait at their wedding" },
      { image: "/assets/photos/couple-shots/0G4A4811.jpg", alt: "Wedding ceremony detail" },
      { image: "/assets/photos/couple-shots/0G4A1676.jpg", alt: "Celebration at a destination wedding" },
      { image: "/assets/photos/couple-shots/0G4A4625.jpg", alt: "Wedding festivities" },
      { image: "/assets/photos/couple-shots/TSR53717.jpg", alt: "Couple at sunset" },
    ],
  },

  finalCta: {
    eyebrow: "Your destination awaits",
    title: "Can't decide?",
    titleAccent: "We'll help you choose.",
    subtitle:
      "Tell us your vibe, your guest count, your season — and we'll curate the perfect destination for your story.",
    button: "Start the conversation",
  },
};
