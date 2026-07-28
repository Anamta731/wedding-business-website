/**
 * Static FAQ bypass — deterministic answers for high-frequency questions.
 * All multi-item answers use markdown "-" bullets so BotMessage renders them as lists.
 * Called before the LLM — no formatting rules from the system prompt apply here.
 *
 * PATTERN RULE: match the core concept/noun, not the full sentence.
 * Users type fragments, typos, and short phrases — patterns must be lenient.
 */

const FAQ_TABLE = [

  // ── Destination-specific (must precede generic \bvenues?\b catch-all) ─────────

  // ── Rajasthan / palace weddings ──────────────────────────────────────────────
  [
    /\b(rajasthan|palace wedding|fort wedding|heritage wedding|royal wedding)\b/i,
    "Rajasthan is our most sought-after destination for palace and heritage weddings. Our confirmed venues across the region:\n- Jaipur — Leela Palace Jaipur, Hyatt Regency Jaipur, Fairmont Jaipur\n- Near Jaipur — Alila Fort Bishangarh (~45 km), Samode Palace\n- Udaipur — Raffles Udaipur\n- Jodhpur — Ajit Bhawan\n- Jaisalmer — Suryagarh Jaisalmer\n- Ranthambore area — Six Senses Fort Barwara, ITC Grand Bharat",
    "Which city or style interests you most?",
  ],

  // ── Goa / beach weddings ─────────────────────────────────────────────────────
  [
    /\bgoa\b|\bbeach\b|\bcoastal wedding\b/i,
    "Goa has some of our finest beach wedding venues:\n- ITC Grand Goa — Indo-Portuguese estate on Arossim Beach, Cansaulim\n- St. Regis Goa — 49-acre sanctuary on the Sal River with private beach access\n- Grand Hyatt Goa — 28-acre Indo-Portuguese estate on Bambolim Bay\n- Taj Exotica Goa — Mediterranean-inspired retreat on Benaulim Beach\n- Taj Cidade de Goa — Hillside heritage property on Vainguinim Beach\n- Caravela Beach Resort — Sprawling beachfront estate on Varca Beach",
    "Which one interests you?",
  ],

  // ── Kerala weddings ──────────────────────────────────────────────────────────
  [
    /\bkerala\b|\bbackwater wedding\b|\bkovalam\b/i,
    "Kerala is beautiful for intimate destination weddings. Our confirmed venues:\n- Taj Green Cove, Kovalam — Balinese-inspired hillside retreat where backwaters meet the sea\n- The Leela Kovalam — India's only clifftop beach resort with panoramic Arabian Sea views",
    "Which setting appeals to you?",
  ],

  // ── Hills / mountain weddings ────────────────────────────────────────────────
  [
    /\b(hill station|hill wedding|mountain wedding|himalaya|rishikesh|dehradun|srinagar|corbett|hills?)\b/i,
    "Our hill station wedding venues — all confirmed:\n- **Taj Corbett** (Uttarakhand) — Jungle riverside retreat, our most intimate and affordable hill option. Buyout ₹80 Lacs–1 Cr\n- **Lalit Grand Palace, Srinagar** (Kashmir) — 1910 royal palace overlooking Dal Lake. Buyout ₹1.6–2.8 Cr\n- **Hyatt Regency Dehradun** — At the foothills of the Himalayas with valley views. Buyout ₹2.2–3.8 Cr\n- **Westin Himalayas, Rishikesh** — Panoramic Himalayan valley, riverside setting. Buyout ₹2.5–3.5 Cr",
    "Would you like detailed pricing for any of these?",
  ],

  // ── Budget / cheap venues ────────────────────────────────────────────────────
  [
    /\b(cheap|budget.friendly|affordable|low.?cost|economical|inexpensive|pocket.friendly)\b/i,
    "Here are our most budget-friendly venues by region — all with confirmed pricing:\n\n**Rajasthan (Heritage)**\n- Ajit Bhawan, Jodhpur — ₹45–75 Lacs buyout (most affordable palace property)\n- Samode Palace — ₹70 Lacs–1.2 Cr buyout\n\n**Bangalore**\n- Kings Meadow — ₹45–70 Lacs buyout\n- Angsana Oasis — ₹50–85 Lacs buyout\n\n**Hills**\n- Taj Corbett, Uttarakhand — ₹80 Lacs–1 Cr buyout\n\n**Kerala**\n- Taj Green Cove, Kovalam — ₹80 Lacs–1.5 Cr buyout\n\nAll buyout figures are venue-hire only — F&B, decor, and planning fees are separate.",
    "Which destination or setting appeals to you most?",
  ],

  // ── All venues / venue listing (catch-all — after destination-specific) ──────
  [
    /\bvenues?\b/i,
    "Here's an overview of the venues we feature across our destinations:\n\n**Goa** — ITC Grand Goa, St. Regis Goa, Grand Hyatt Goa, Taj Exotica Goa, Taj Cidade de Goa, Caravela Beach Resort\n\n**Rajasthan** — Leela Palace Jaipur, Hyatt Regency Jaipur, Fairmont Jaipur, Alila Fort Bishangarh, Samode Palace, Raffles Udaipur, Ajit Bhawan Jodhpur, Six Senses Fort Barwara, Suryagarh Jaisalmer, ITC Grand Bharat\n\n**Kerala** — Taj Green Cove Kovalam, The Leela Kovalam\n\n**Hill Stations** — Westin Himalayas Rishikesh, Taj Corbett, Hyatt Regency Dehradun, Lalit Grand Palace Srinagar\n\n**Delhi** — Leela Palace Delhi, ITC Maurya\n\n**Mumbai** — Taj Lands End, Grand Hyatt BKC, Fairmont Sahar\n\n**Bangalore** — ITC Gardenia, Taj West End, Prestige Golfshire, Kings Meadow, Angsana Oasis\n\nBeyond these, we plan weddings at any destination worldwide — just tell us where you have in mind and we'll curate the right options.",
    "Which destination or style interests you most?",
  ],

  // ── Planning packages / tiers ────────────────────────────────────────────────
  [
    /\bpackages?\b|\bplanning tiers?\b|\bservice tiers?\b|\bplanning options?\b/i,
    "We offer three planning tiers:\n\n**Full Planning — ₹3–8 Lacs**\nComplete end-to-end planning from scratch — venue sourcing, all vendor negotiations, contract management, design conceptualisation, guest management, site visits, and post-wedding settlements. Best for couples starting fresh.\n\n**Destination / Luxury Planning — ₹8–15 Lacs**\nSame full-service scope, elevated for large-scale destination weddings — higher staff-to-guest ratio, more intensive on-ground presence, and elevated detailing.\n\n**Partial Planning**\nYou've already secured a venue or some vendors — we step in, fill the gaps, and take full ownership of coordination and execution. Fee depends on scope.\n\nAll planning fees are separate from venue, catering, decor, and vendor costs.",
    "Which tier sounds closest to what you need?",
  ],

  // ── Minimum budget ───────────────────────────────────────────────────────────
  [
    /\bmin(imum)? budget\b|\bstarting (budget|cost|price)\b|\bhow much (to start|minimum|at least)\b|\bsmallest budget\b/i,
    "Our planning fee starts at ₹3 Lakhs for Full Planning. There's no rigid minimum for the overall wedding budget, but our network of premium vendors and luxury venues works best for celebrations starting from ₹50 Lakhs upwards.",
    "Happy to give you a clearer picture once I know your destination and approximate guest count.",
  ],

  // ── International weddings ───────────────────────────────────────────────────
  [
    /\b(international|outside india|abroad|overseas|foreign)\b/i,
    "Yes — we plan destination weddings worldwide. Backed by our corporate infrastructure and 30 international offices, we handle cross-border vendor curation, guest logistics, ticketing, planning, and on-site execution seamlessly.",
    "Happy to discuss international options once I know the destination you have in mind.",
  ],

  // ── How long to get started / onboarding ────────────────────────────────────
  [
    /\bhow long\b|\bonboarding\b|\bget started\b|\bwhat('s| is) the process\b|\bhow does it work\b|\bnext steps?\b|\bwhat happens (next|after)\b/i,
    "Our onboarding process ideally spans 15–20 days to ensure we are a perfect fit for your vision:\n1. Initial Discovery (Days 1–5): A detailed consultation to understand your scope, aesthetic direction, and venue preferences.\n2. Custom Proposal (Days 6–10): We present a tailored service outline, tentative budget framework, and fee structure.\n3. Alignment & Signing (Days 11–20): Finalising contract clauses, scope details, and processing the retainer to officially secure your dates on our calendar.",
    "I'd love to connect you with our planning team to start this process — would you like to schedule a quick call?",
  ],

  // ── Exclusivity / how many weddings ─────────────────────────────────────────
  [
    /\bhow many (weddings|clients|couples)\b|\bexclusive\b|\bdedicated (planner|team|attention)\b|\bother (weddings|clients)\b|\bcalendar (capacity|limit)\b/i,
    "We strictly limit our calendar to maintain a boutique standard. We take a maximum of one flagship destination or full-service wedding at a time, and two local weddings in Delhi. This means our principal planners are 100% dedicated to your celebration — no divided attention.",
    "",
  ],

  // ── Multi-faith / non-Hindu ──────────────────────────────────────────────────
  [
    /\b(non.?hindu|christian|muslim|sikh|civil ceremony|interfaith|inter.?faith|multicultural|cross.?cultural|different religion|other faith|other religion)\b/i,
    "Absolutely. Our team is experienced across all religions and cultures — Hindu, Muslim, Sikh, Christian, civil, and fusion ceremonies. We research the unique rituals and structural flow of every ceremony we plan, so your personal heritage is honoured with the same care we bring to every wedding.",
    "",
  ],

  // ── Vendor backup / cancellation ────────────────────────────────────────────
  [
    /\bvendor cancel\b|\bbackup (plan|vendor)\b|\blast.?minute cancel\b|\bcontingency\b|\bwhat if.{0,20}cancel\b/i,
    "Last-minute vendor cancellations are extremely rare in our network since we work with vetted, elite partners. If an emergency does occur, we take immediate charge — we maintain active backup relationships with top-tier decor houses, caterers, and artists, and secure an equivalent pre-vetted replacement without interrupting your experience or adding unexpected costs.",
    "",
  ],

  // ── Planning fee vs venue costs ──────────────────────────────────────────────
  [
    /\bplanning fee\b|\bmanagement fee\b|\byour fee\b|\bfee (separate|include|cover)\b|\bdoes (the |your )?fee include\b|\bwhat do you charge\b/i,
    "Our planning and management fee is completely separate from venue, catering, and vendor costs. We operate on a transparent, fixed fee structure based on your service tier. All payments to venues and third-party vendors are made directly by you — this ensures fully unbiased recommendations and complete budget visibility.",
    "Happy to share the exact fee structure once I know your wedding scope.",
  ],

  // ── Destination-specific moodboards ─────────────────────────────────────────
  [
    /moodboard.{0,30}(goa|beach)|goa.{0,30}moodboard|(beach|coastal).{0,20}(theme|mood|aesthetic|look)/i,
    "For a Goa beach wedding, these moodboards work beautifully:\n\nMehendi:\n- Tropical Rhapsody — tropical blooms, vibrant greens, exotic and colorful — perfect for beachside\n- Tangerine Tales — tangerine hues, lush greens, sun-drenched and bohemian\n\nHaldi:\n- Citrus Bloom — citrus tones, marigolds, joyful daytime energy\n\nSangeet:\n- Disco Shimmer — glittering mirrors, dance floor energy, great for indoor ballrooms\n\nWedding:\n- Painted Gardens — pastel florals, daytime garden feel\n- Royal Indian — gold and deep reds if you want grandeur even by the beach\n[MOODBOARDS_LINK]",
    "Which function are you most focused on styling first?",
  ],
  [
    /moodboard.{0,30}(rajasthan|palace|royal|heritage)|rajasthan.{0,30}moodboard|(palace|royal|heritage).{0,20}(theme|mood|aesthetic|look)/i,
    "For a Rajasthan palace wedding, these moodboards are a natural fit:\n\nWedding:\n- Royal Indian — palatial grandeur, maroon and gold, made for heritage venues\n- Haveli Nights — candlelit romance, jewel tones, glowing lanterns and arches\n\nHaldi:\n- Rangon Ki Rasleela — vibrant and festive, gulal colors and marigolds\n- Royal Boho — terracotta and amber, relaxed yet opulent\n\nSangeet:\n- Crimson Soiree — Moulin Rouge-inspired drama, perfect for a Rajasthani fort at night\n[MOODBOARDS_LINK]",
    "Which function are you most focused on styling first?",
  ],
  [
    /moodboard.{0,30}(kerala|backwater)|(kerala|backwater).{0,30}moodboard|(tropical|lush|intimate).{0,20}(theme|mood|aesthetic)/i,
    "For a Kerala wedding, these moodboards work well:\n\nMehendi:\n- Tropical Rhapsody — tropical blooms, vibrant greens, exotic — mirrors Kerala's lush landscape\n- Tangerine Tales — warm citrus hues, perfect for a daytime mehendi by the backwaters\n\nWedding:\n- Emerald Eden — deep greens, organic and intimate, perfect for backwater and hillside settings\n- Painted Gardens — soft pastels and florals for a daytime ceremony\n[MOODBOARDS_LINK]",
    "Which function are you most focused on styling first?",
  ],
  [
    /moodboard.{0,30}(hill|mountain|forest|jungle)|(hill|mountain|forest).{0,30}moodboard/i,
    "For a hills wedding, these moodboards complement the setting:\n\nWedding:\n- Emerald Eden — deep greens, forest tones, organic and intimate — built for hill stations\n- Haveli Nights — jewel tones and warm candlelight work beautifully in mountain evenings\n\nHaldi:\n- Royal Boho — terracotta and sage, relaxed outdoor feel\n\nSangeet:\n- Disco Shimmer — high energy for an indoor ballroom evening\n[MOODBOARDS_LINK]",
    "Which function are you most focused on styling first?",
  ],

  // ── Individual moodboard by name ─────────────────────────────────────────────
  [
    /\bhaveli nights?\b/i,
    "Haveli Nights is a Wedding moodboard drawing inspiration from the romance and grandeur of old Indian havelis. Rich drapery, glowing lanterns, intricate arches, regal florals, and warm candlelight — the palette blends deep jewel tones, antique golds, and earthy neutrals. Intimate, opulent, and timeless. Perfect for evening receptions in palace courtyards, heritage venues, or candlelit fort settings.\n[MOODBOARDS_LINK]",
    "Want to see Rajasthan venues that complement this mood?",
  ],
  [
    /\broyal indian\b/i,
    "Royal Indian is a Wedding moodboard celebrating India's regal heritage — majestic architecture, ornate detailing, luxurious fabrics, and statement décor. Inspired by palace soirées and royal courts, deep reds, warm golds, glowing ambers, and jewel tones create an atmosphere that feels grand, immersive, and unapologetically luxurious. Ideal for large receptions at historic palaces.\n[MOODBOARDS_LINK]",
    "Want to see palace venues that complement this look?",
  ],
  [
    /\bemerald eden\b/i,
    "Emerald Eden is a Wedding moodboard rooted in deep greens and quiet moss — a celebration that feels grown, not made. Organic, intimate, and deeply connected to nature. Deep teal, forest green, sage, mint, and champagne make it perfect for small groups, eco-conscious couples, and hill station weddings.\n[MOODBOARDS_LINK]",
    "Want to see hill station venues that suit this theme?",
  ],
  [
    /\bpainted gardens?\b/i,
    "Painted Gardens is a Wedding moodboard — a breathtaking immersion into a pastel wonderland. Vivid floral artistry, delicate pastel fabrics, and the timeless romance of an enchanted garden setting. Blush pink, leaf green, pale yellow, light pink, and dark olive — perfect for daytime weddings and garden venues.\n[MOODBOARDS_LINK]",
    "Want to see outdoor venues that complement this theme?",
  ],
  [
    /\bcitrus bloom\b/i,
    "Citrus Bloom is a Haldi moodboard — a vibrant fusion of citrus tones and sunshine yellows. Fresh marigolds, zesty accents, and warm joyful energy. The palette is orange, olive green, coral, golden yellow, and cream. Perfect for outdoor daytime Haldi celebrations, vibrant themes, and tropical settings.\n[MOODBOARDS_LINK]",
    "Want to explore the other Haldi moodboards — Royal Boho or Rangon Ki Rasleela?",
  ],
  [
    /\broyal boho\b/i,
    "Royal Boho is a Haldi moodboard — a free-spirited blend of regal textures and bohemian charm. Terracotta accents, macramé details, and a relaxed yet opulent atmosphere. Amber, sage, terracotta, sand, and dark brown — ideal for outdoor sunset Haldi ceremonies and intimate gatherings.\n[MOODBOARDS_LINK]",
    "Want to explore Citrus Bloom or Rangon Ki Rasleela — the other Haldi moodboards?",
  ],
  [
    /\brangon ki rasleela\b/i,
    "Rangon Ki Rasleela is a Haldi moodboard — vibrant, playful, and full of energy. Inspired by gulal, marigolds, sunshine hues, and festive Indian textures. Gulal red, marigold yellow, turmeric, coral, and bright pink create an atmosphere that is festive, youthful, and deeply celebratory.\n[MOODBOARDS_LINK]",
    "Want to explore Citrus Bloom or Royal Boho — the other Haldi moodboards?",
  ],
  [
    /\btangerine tales\b/i,
    "Tangerine Tales is a Mehendi moodboard — a zesty celebration of colour and tradition. Tangerine hues meet lush greens, creating a spirited and sun-drenched experience. Tangerine, orange, golden, olive, and salmon — perfect for daytime celebrations, vibrant outdoors, and poolside parties.\n[MOODBOARDS_LINK]",
    "Want to explore Tropical Rhapsody — the other Mehendi moodboard?",
  ],
  [
    /\btropical rhapsody\b/i,
    "Tropical Rhapsody is a Mehendi moodboard — a lush, exotic escape filled with vibrant tropical blooms and emerald greens. Emerald green, yellow, coral orange, hot pink, and teal work beautifully for beachside venues, summer celebrations, and lush garden settings.\n[MOODBOARDS_LINK]",
    "Want to explore Tangerine Tales — the other Mehendi moodboard?",
  ],
  [
    /\bdisco shimmer\b/i,
    "Disco Shimmer is a Sangeet moodboard — glittering mirrors, pulsing lights, and an energy that doesn't quit. Designed for the dance floor. Black, silver, indigo, amber, and white create a high-energy atmosphere perfect for large parties, indoor ballrooms, and cocktail nights.\n[MOODBOARDS_LINK]",
    "Want to explore Crimson Soiree — the other Sangeet moodboard?",
  ],
  [
    /\bcrimson soirée?|\bcrimson soiree\b/i,
    "Crimson Soiree is a Sangeet moodboard — a seductive fusion of Parisian cabaret and Indian tradition. Crimson velvets, dramatic feathers, and a Moulin Rouge-inspired glamour. Crimson, dark maroon, gold, rose gold, and black — perfect for themed Sangeets, bold personalities, and nighttime glamour.\n[MOODBOARDS_LINK]",
    "Want to explore Disco Shimmer — the other Sangeet moodboard?",
  ],

  // ── Function-specific moodboards ─────────────────────────────────────────────
  [
    /\bhaldi.{0,30}(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?)|\b(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?).{0,30}haldi/i,
    "We have three moodboards for the Haldi ceremony:\n- Citrus Bloom — citrus tones, marigolds, sunshine yellows, joyful daytime energy\n- Royal Boho — terracotta accents, macramé details, relaxed bohemian luxe\n- Rangon Ki Rasleela — vibrant gulal colours, marigolds, festive and playful\n[MOODBOARDS_LINK]",
    "Which of these feels right for your Haldi?",
  ],
  [
    /\b(mehndi|mehendi).{0,30}(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?)|\b(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?).{0,30}(mehndi|mehendi)/i,
    "We have two moodboards for the Mehendi ceremony:\n- Tangerine Tales — tangerine hues, lush greens, sun-drenched and bohemian\n- Tropical Rhapsody — vibrant tropical blooms, emerald greens, exotic and colourful\n[MOODBOARDS_LINK]",
    "Which of these feels right for your Mehendi?",
  ],
  [
    /\bsangeet.{0,30}(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?)|\b(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?).{0,30}sangeet/i,
    "We have two moodboards for the Sangeet:\n- Disco Shimmer — glittering mirrors, pulsing lights, built for the dance floor\n- Crimson Soiree — Moulin Rouge-inspired drama, crimson velvets, nighttime glamour\n[MOODBOARDS_LINK]",
    "Which of these suits your Sangeet vibe?",
  ],
  [
    /\b(wedding ceremony|reception).{0,30}(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?)|\b(moodboards?|themes?|looks?|moods?|styles?|options?|ideas?).{0,30}(wedding ceremony|reception)/i,
    "We have four moodboards for the Wedding ceremony:\n- Royal Indian — palatial grandeur, maroon and gold, made for heritage venues\n- Haveli Nights — candlelit haveli romance, jewel tones, glowing lanterns\n- Painted Gardens — pastel floral canopies, daytime garden ceremony\n- Emerald Eden — deep greens, organic and intimate, perfect for hill stations\n[MOODBOARDS_LINK]",
    "Which of these speaks to your wedding vision?",
  ],

  // ── General moodboards ───────────────────────────────────────────────────────
  [
    /moodboard|mood board|wedding themes?|decor themes?|decor style|wedding style|theme option/i,
    "We have curated moodboards across all wedding functions:\n\nHaldi:\n- Citrus Bloom — citrus tones, marigolds, joyful daytime energy\n- Royal Boho — terracotta, macramé, relaxed bohemian luxe\n- Rangon Ki Rasleela — vibrant gulal colors, festive and playful\n\nMehendi:\n- Tangerine Tales — tangerine hues, lush greens, sun-drenched\n- Tropical Rhapsody — tropical blooms, exotic and colorful\n\nSangeet:\n- Disco Shimmer — glittering mirrors, dance floor energy, indoor ballrooms\n- Crimson Soiree — Moulin Rouge-inspired, crimson velvets, nighttime glamour\n\nWedding:\n- Royal Indian — palatial grandeur, maroon and gold, heritage venues\n- Painted Gardens — pastel floral canopies, daytime garden ceremony\n- Haveli Nights — candlelit haveli romance, jewel tones, evening receptions\n- Emerald Eden — deep greens, organic and intimate, perfect for hill stations\n[MOODBOARDS_LINK]",
    "",
  ],

  // ── Itinerary ────────────────────────────────────────────────────────────────
  [
    /\bitinerary\b|\bday.by.day\b|\bwedding (schedule|timeline|flow|programme)\b|\bsample (wedding|plan)\b/i,
    "Here's a sample **2-Day, 4-Function** destination wedding flow:\n\n**Day 1**\n- Afternoon: Welcome Lunch & Mehendi — henna artistry, live music, joyful anticipation\n- Evening: High-Energy Sangeet & Afterparty — performances, live artists, celebration\n\n**Day 2**\n- Morning: Intimate Haldi & Choorah — turmeric blessings, family traditions\n- Sunset: Main Pheras & Formal Reception — sacred vows, world-class reception dinner\n\nEvery function has its own décor theme, guest experience arc, and F&B programme. The structure is fully flexible — 1 day, 3 days, or more.",
    "Which function would you like to explore further?",
  ],

  // ── Customise itinerary ───────────────────────────────────────────────────────
  [
    /\b(customis|customiz|tailor|personalise|personalize|modify|change|adjust|flexible|adapt).{0,20}(itinerary|plan|package|wedding|function)\b/i,
    "Absolutely — the 2-Day 4-Function Flow is a starting point, not a fixed script. We can adjust the sequence of functions, add ceremonies, change the timing, expand to 3 days, or restructure entirely around your vision.\n\nTell me what feels most important to you and we'll shape it from there.",
    "",
  ],

  // ── Ceremony-specific ─────────────────────────────────────────────────────────
  [
    /\b(haldi|chura|sagan|sangeet|mehndi|mehendi|bidaai|varmala|baraat)\b/i,
    "Yes — we handle all pre-wedding and wedding ceremonies as part of the planning process. This includes Haldi, Chura, Sagan, Mehndi, Sangeet, Baraat, Varmala, and the main wedding rituals. Each is styled and coordinated by our team, and all ceremonies can be designed individually or combined into a multi-day itinerary.\n\nFor Haldi specifically, we also have dedicated moodboards — Citrus Bloom, Royal Boho, and Rangon Ki Rasleela.\n[MOODBOARDS_LINK]",
    "",
  ],

  // ── Help choose destination ───────────────────────────────────────────────────
  [
    /\b(help (me )?choose|can.t decide|not sure (which|where)|compare (destination|goa|rajasthan|kerala|hills))\b/i,
    "A few questions help us match you quickly. The three things that matter most are the atmosphere you want (grand royal, relaxed beach, lush tropical, or dramatic hills), your approximate guest count, and whether you want a single-venue buyout or a more open setup.\n\nThinking about atmosphere first — which feels most you: a palace in the desert, beachside in Goa, the backwaters of Kerala, or a Himalayan valley?",
    "",
  ],

  // ── What makes V&V different ────────────────────────────────────────────────
  [
    /\b(why (choose|pick|use|go with) (you|vows|v&v)|what (makes|sets) you (apart|different|special|unique)|stand out|what.s special)\b/i,
    "A few things set us apart:\n- Deep cultural knowledge paired with an international design sensibility\n- Every couple gets a dedicated wedding manager — one person, start to finish\n- Backed by GeTSHolidays — 37+ years of event expertise, 150+ professionals\n- 300+ weddings crafted across India and abroad",
    "Happy to walk you through how we'd approach your specific wedding.",
  ],

  // ── How early to book ───────────────────────────────────────────────────────
  [
    /\bhow (early|far|soon) (should|do|to)\b|\bwhen (should|to) book\b|\blead time\b|\bhow (much )?advance\b/i,
    "It depends on the scale:\n- Destination weddings — 12–18 months ahead to lock in the venue\n- Local weddings — 6–12 months is usually enough\n- Shorter timelines — we occasionally accommodate these, reach out and we'll see what's possible",
    "If you have a rough date in mind, I can check what's realistic for the venues you're interested in.",
  ],

  // ── Single point of contact ──────────────────────────────────────────────────
  [
    /\b(single|one|dedicated|same).{0,20}\b(point of contact|person|manager|coordinator|planner)\b|\bwho (will|do) (i|we) (deal|work|speak|talk) with\b/i,
    "Yes — every couple gets a dedicated wedding manager who stays with you from the first call to the final farewell. You'll never be passed around or have to repeat yourself.",
    "I'd be happy to introduce you to the team when you're ready.",
  ],

  // ── Services offered ─────────────────────────────────────────────────────────
  [
    /\bservices?\b/i,
    "We cover every aspect of your wedding across 9 core services:\n- Venues & Destinations — every setting handpicked globally\n- Planning — every detail considered, every moment orchestrated\n- Design & Decor — immersive environments crafted to your story\n- Film & Photography — cinematic storytelling, raw emotion, editorial craft\n- Entertainment — concert-grade production, curated talent\n- Hospitality — white-glove guest management from arrival to departure\n- Vendor Management — India's elite artisan network, fully managed\n- Travel & Logistics — seamless transport and guest transit\n- Food & Beverage — bespoke menus and world-class bar curation\n\nAdd-ons: 3-D Models, SFX & Fireworks, E-Invites, Home Decor, Wedding Website, Trousseau Shopping, Gifting & Favours, Honeymoon Planning, Marriage Registration, Visa Assistance.",
    "Which of these would you like to explore first?",
  ],

  // ── Partial / venue-only planning ───────────────────────────────────────────
  [
    /\bpartial planning\b|\bpartial (service|package)\b|\bvenue.?only\b|\bcoordination only\b|\balready (booked|have).{0,15}venue\b|\bjust (need|want).{0,20}(coordination|execution|on.ground)\b|\bhow does partial\b/i,
    "Partial planning is for couples who have already secured a venue or booked some vendors and need Vows & Vedas to step in, fill the gaps, and take ownership of execution:\n- We audit what's already in place and identify what's missing\n- Source and negotiate any remaining vendors\n- Manage all contracts and coordination going forward\n- Handle complete on-ground execution across every function\n- Ensure the vision stays consistent even when you've mixed vendors\n\nIt's ideal if you've done some groundwork but want a professional team to bring it all together flawlessly.",
    "The fee for partial planning depends on how much is already in place and what we need to take over. I'd love to connect you with our planning team for a precise scope — shall I arrange that?",
  ],

  // ── Full vs partial comparison ───────────────────────────────────────────────
  [
    /\b(full vs partial|partial vs full|difference between.{0,20}plan|compare.{0,20}plan(ning)? (tiers?|types?|options?))\b/i,
    "Here's how our planning tiers work:\n\n**Full Planning (₹3–8 Lacs)** — We handle everything from scratch: venue sourcing, all vendor negotiations, contract management, design, guest management, site visits, and post-wedding settlements. Best if you're starting fresh.\n\n**Destination / Luxury Planning (₹8–15 Lacs)** — Same full-service scope, elevated for large-scale destination weddings with a higher staff-to-guest ratio and more intensive on-ground presence.\n\n**Partial Planning** — You've already booked a venue or some vendors; we step in, fill the gaps, coordinate everything, and take complete ownership of execution. Fee depends on scope.\n\n**Venue-Only Sourcing** — If you just need us to find and secure the right venue, we can do that too.",
    "Which tier feels closest to what you need?",
  ],

  // ── What's included in planning ──────────────────────────────────────────────
  [
    /\bwhat.{0,10}included\b|\bwhat.{0,10}(cover|involve|get)\b.*\bplan(ning)?\b|\bplanning.{0,10}inclusions?\b/i,
    "Our planning service covers:\n- Venue sourcing and selection\n- All vendor negotiations\n- Contract management\n- Detailed design conceptualisation\n- Guest management support\n- Multiple planning meetings\n- Site visits\n- Post-wedding vendor settlements\n\nFor Luxury / Destination Planning, the inclusions stay the same — what changes is the scale of execution, level of personalisation, and the staff-to-guest ratio.",
    "I'd love to connect you with our planning team to walk you through this in detail — would you like to schedule a quick call?",
  ],

  // ── Photography / film ───────────────────────────────────────────────────────
  [
    /\b(photos?|photographs?|photography|film|video|cinemat|reel|memories|capture)\b/i,
    "Our Film & Photography service pairs you with India's finest wedding photographers and cinematographers:\n- Editorial & cinematic photographer matchmaking\n- Creative briefing & art direction\n- Comprehensive shot listing & logistics\n- BTS & real-time content creation\n- Post-production & archive management",
    "Happy to share portfolios of photographers who match your preferred style.",
  ],

  // ── Decor / design ───────────────────────────────────────────────────────────
  [
    /\b(decor|decoration|floral|mandap|lighting|scenograph|design.*wedding|wedding.*design)\b/i,
    "Our Design & Decor team builds immersive environments from scratch:\n- Bespoke conceptualising & moodboards\n- Immersive floral artistry\n- Custom scenography & production\n- Strategic lighting & soundscaping\n- Fine table styling & finer details\n\nEvery environment is crafted to reflect your unique story.",
    "Happy to discuss a theme or share moodboards — what style are you drawn to?",
  ],

  // ── Entertainment ────────────────────────────────────────────────────────────
  [
    /\b(entertainment|performers?|celebrity artist|live (music|band|act)|dj|choreograph|sangeet show)\b/i,
    "Our Entertainment service delivers concert-grade production with curated talent:\n- Live performances and celebrity artist bookings\n- Sangeet choreography programming\n- DJ and music direction\n- Custom sound and lighting production\n- Fully programmed entertainment experiences from entry to finale",
    "Let me know the vibe you're going for — high-energy Bollywood, soulful classical, or something entirely different.",
  ],

  // ── Hospitality / guest management ───────────────────────────────────────────
  [
    /\b(hospitality|guest (management|handling|experience|care|arrival|transfer)|airport (transfer|pickup)|welcome (guest|kit)|vip (arrival|guest))\b/i,
    "Our Hospitality service provides white-glove guest management from arrival to departure:\n- Airport and venue transfers\n- VIP arrivals and guest escort coordination\n- Accommodation management\n- Guest welcome kits and on-ground concierge\n- Ensuring every guest feels completely looked after throughout",
    "How many guests are you expecting? That helps us plan the right hospitality scale.",
  ],

  // ── Travel & Logistics ───────────────────────────────────────────────────────
  [
    /\b(travel logistics|guest (shuttle|transit|movement)|fleet coordination|ticketing|guest travel|how (do guests|everyone) get)\b/i,
    "Our Travel & Logistics service manages every movement seamlessly:\n- Efficient fleet coordination and guest shuttles\n- Ticketing and travel booking\n- VIP arrivals and airport transfers\n- Complete guest transit planning so every journey is calm and perfectly timed",
    "Where are your guests travelling from? That helps us suggest the right setup.",
  ],

  // ── Food & Beverage ──────────────────────────────────────────────────────────
  [
    /\b(catering|cuisine|food|menu|bar service|cocktail|beverage|chef)\b/i,
    "Our Food & Beverage service delivers a complete culinary experience:\n- Bespoke menu design tailored to your vision and guest preferences\n- Chef and catering team coordination\n- World-class bar curation and cocktail programming\n- Dietary and regional cuisine accommodation\n- Live counters and experiential dining setups",
    "Do you have a cuisine preference or specific dietary requirements in mind?",
  ],

  // ── Add-ons ──────────────────────────────────────────────────────────────────
  [
    /\b(add.?ons?|3d (model|visual|render)|sfx|fireworks?|e.?invites?|digital invitation|wedding website|trousseau|gifting|favou?rs?|honeymoon plan|marriage registr|visa assist)\b/i,
    "We offer 10 add-on services:\n- 3-D Models — photorealistic venue visualisation before setup\n- SFX & Fireworks — pyrotechnics and atmospheric effects for grand entries\n- E-Invites — custom digital invitations with RSVP tracking\n- Home Decor — floral and lighting for residential pre-wedding functions\n- Wedding Website — guest hub with RSVPs, gallery, and travel itineraries\n- Trousseau Shopping — designer previews and bridal wardrobe styling\n- Gifting & Favours — custom hampers and artisanal welcome gifts\n- Honeymoon Planning — tailored luxury itineraries globally\n- Marriage Registration — paperwork, slot booking, and registry guidance\n- Visa Assistance — guest visa processing and embassy appointment support",
    "Which of these interests you?",
  ],

  // ── Pricing / cost / budget ──────────────────────────────────────────────────
  [
    /\b(pricing|price list|cost|how much|charges|fees|rates?|budget)\b/i,
    "Our planning packages:\n- Full Planning — ₹3–8 Lacs — complete planning from scratch\n- Destination / Luxury Planning — ₹8–15 Lacs — elevated for large-scale destination weddings\n\nThese are planning fees only — venue costs, decor, catering, and vendors are separate. Venue buyouts in our portfolio range from ₹45 Lacs (Ajit Bhawan, Jodhpur) to ₹7 Cr+ (Fairmont Sahar, Mumbai).",
    "Share your destination and rough guest count and I can give you a full cost breakdown.",
  ],

  // ── Guest count ──────────────────────────────────────────────────────────────
  [
    /\b(how many guests|guest count|guest list|minimum guests|maximum guests|pax)\b/i,
    "We plan weddings of all sizes — from intimate 20-person ceremonies to grand celebrations with 1,000+ guests. The venue we suggest will depend largely on your headcount.",
    "Once you share a rough number, I can suggest venues that fit beautifully.",
  ],

  // ── Book / discovery call ────────────────────────────────────────────────────
  [
    /\bdiscovery call\b|\b(book|schedule|arrange).{0,20}(call|consultation|meeting|appointment)\b|\bhow (do i|to|can i) (book|schedule|connect|reach|speak|talk)\b/i,
    "To book a discovery call with our planning team:\n- **WhatsApp / Call** — +91 96542 77656\n- **Email** — info@vowsandvedas.com\n- **Enquiry form** — tap 'Speak to us' below\n\nOur team usually responds within 24 hours to schedule a time that works for you.",
    "",
  ],

  // ── Contact / reach out ──────────────────────────────────────────────────────
  [
    /\b(contact|reach out|speak to|talk to|connect with|get in touch|whatsapp|call us|email us|how to reach)\b/i,
    "You can reach the Vows & Vedas team directly:\n- **Email** — info@vowsandvedas.com\n- **WhatsApp / Call** — +91 96542 77656\n- **Enquiry form** — tap 'Speak to us' below or visit our contact page\n\nWe usually respond within 24 hours.",
    "",
  ],

];

// If the query names a specific venue, skip all static FAQs and let the LLM
// handle it — static answers can't do per-venue pricing or city-scoped details.
const VENUE_KEYWORDS = [
  'itc grand goa', 'st. regis', 'st regis', 'grand hyatt goa', 'taj exotica',
  'taj cidade', 'caravela', 'alila', 'samode', 'raffles udaipur',
  'fairmont jaipur', 'fairmont sahar', 'ajit bhawan', 'six senses', 'suryagarh',
  'itc grand bharat', 'westin rishikesh', 'westin himalayas', 'taj corbett',
  'hyatt regency dehradun', 'hyatt regency jaipur', 'lalit grand palace',
  'taj green cove', 'leela kovalam', 'leela palace', 'itc maurya',
  'taj lands end', 'grand hyatt bkc', 'itc gardenia', 'taj west end',
  'prestige golfshire', 'kings meadow', 'angsana oasis',
];

/**
 * Returns a static answer string if the query matches, otherwise null.
 */
export function matchStaticFaq(query, leadCaptured = false) {
  if (!query || query.trim().length < 2) return null;

  // Venue-specific queries must go to the LLM
  const lq = query.toLowerCase();
  if (VENUE_KEYWORDS.some(name => lq.includes(name))) return null;

  for (const [pattern, body, handoff] of FAQ_TABLE) {
    if (pattern.test(query)) {
      if (leadCaptured || !handoff) return body;
      return `${body}\n\n${handoff}`;
    }
  }
  return null;
}
