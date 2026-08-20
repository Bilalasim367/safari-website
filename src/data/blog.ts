// Blog content for the Safari Perfumes guides section.
// Content is informational and reflects real product data (names, prices, types).
// Product links use markdown-style [text](/shop/slug) tokens rendered safely.

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  category: string
  readTime: string
  content: BlogBlock[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'designer-perfume-impressions-guide-pakistan',
    title: 'Designer Perfume Impressions in Pakistan: A Complete Guide',
    description:
      'What are designer perfume impressions, why are they so popular in Pakistan, and how do you pick a good one? A practical guide with PKR prices.',
    date: '2026-08-20',
    category: 'Buying Guides',
    readTime: '4 min read',
    content: [
      {
        type: 'p',
        text: 'If you have searched for fragrances online in Pakistan, you have almost certainly seen the word "impression". A perfume impression is a fragrance created to smell close to a well-known designer scent, but it is not a counterfeit — it is an original formulation inspired by the profile of the original. This is a key difference from a fake, which copies the bottle and branding illegally.',
      },
      {
        type: 'h2',
        text: 'Why impressions make sense for most buyers',
      },
      {
        type: 'p',
        text: 'Designer fragrances are priced in foreign currency and can cost several times a typical monthly budget by the time they reach Pakistan. Impressions give you the same family of scent — the notes, the mood, the occasion fit — at a fraction of the price. At Safari Perfumes, impressions are clearly labelled with the designer name they are inspired by, so you always know exactly what you are getting.',
      },
      {
        type: 'h2',
        text: 'How to choose a good impression',
      },
      {
        type: 'ul',
        items: [
          'Match the scent family to your style: fresh aquatics like [Acqua Di Gio Profondo Elixir By Armani](/shop/acqua-di-gio-profondo-elixir-by-armani) suit daytime, while woody spices like [Spicebomb By Viktor & Rolf](/shop/spicebomb-by-viktor-rolf) shine in the evening.',
          'Check the size: most perfumes at Safari start at PKR 250 for a 3ml tester and scale up to 50ml bottles, so you can try before you commit.',
          'Read the notes (top, heart, base) listed on the product page — they tell you how the scent will develop through the day.',
        ],
      },
      {
        type: 'p',
        text: 'Three impressions we regularly restock: [Fahrenheit By Dior](/shop/fahrenheit-by-dior) for its iconic leather-and-violet profile, [Sauvage Elixir By Dior](/shop/sauvage-elixir-by-dior) for a bolder evening statement, and [Aventus By Creed - Prm](/shop/aventus-by-creed---prm) in attar form for lovers of pineapple-and-smoke notes without the designer price tag.',
      },
      {
        type: 'h2',
        text: 'The bottom line',
      },
      {
        type: 'p',
        text: 'Buying impressions is about being honest with yourself about what you want: the experience of wearing a famous scent, at a price that makes sense in PKR. Every Safari impression is listed with the original it is inspired by — nothing is passed off as the real designer product.',
      },
    ],
  },
  {
    slug: 'oud-vs-attar-difference',
    title: "Oud vs Attar: What's the Difference and Which Should You Choose?",
    description:
      'Attar is a concentrated fragrance oil; oud is a specific ingredient (agarwood resin). Here is how they differ, how they combine, and which to pick in Pakistan.',
    date: '2026-08-18',
    category: 'Fragrance Education',
    readTime: '3 min read',
    content: [
      {
        type: 'p',
        text: 'The terms "oud" and "attar" are often used interchangeably in Pakistan, but they describe two different things. Understanding the difference helps you buy the right fragrance — and avoid paying for a name.',
      },
      {
        type: 'h2',
        text: 'Attar is a format, oud is an ingredient',
      },
      {
        type: 'p',
        text: 'An attar (or ittar) is a concentrated perfume oil — traditionally alcohol-free, made by distilling flowers, woods, and resins into a carrier oil. A drop or two is enough, and it sits closer to the skin. Oud, on the other hand, is a raw material: the dark, resinous heartwood of the agarwood tree, prized for its smoky, leathery, almost medicinal richness. An attar can be made with oud — and often is — but not every attar contains oud, and not every oud product is an attar.',
      },
      {
        type: 'h2',
        text: 'Which should you choose?',
      },
      {
        type: 'ul',
        items: [
          'Choose an attar if you want portability, intensity, and a scent that lasts on the skin. [White Rose](/shop/white-rose) is a gentle floral attar; [Mukhallat By Swiss Arabian](/shop/mukhallat-by-swiss-arabian) blends several notes in the classic mukhallat style.',
          'Choose a perfume (alcohol-based spray) if you want projection and variety across the day — sprays carry further and are easier to re-apply.',
          'Choose an oud-heavy option if you want depth: [Aventus By Creed - Prm](/shop/aventus-by-creed---prm) is a popular woody impression in attar form.',
        ],
      },
      {
        type: 'h2',
        text: 'A practical note on pricing',
      },
      {
        type: 'p',
        text: 'Real oud oil is expensive because it takes decades for agarwood trees to produce resin. Genuine attars with heavy oud content will never be the cheapest item on a shelf. If a price looks too good for a pure-oud product, check whether it is actually an oud-flavoured blend — which can be perfectly good, but is not the same thing. Safari labels each product with its type (Attar or Perfume) and its ingredients, so you can compare honestly.',
      },
    ],
  },
  {
    slug: 'how-to-make-perfume-last-longer',
    title: 'How to Make Your Perfume Last Longer: 9 Practical Tips',
    description:
      'Fragrance fading too fast? These 9 tested techniques — from moisturising to pulse points to storage — will help your perfume and attar last all day.',
    date: '2026-08-15',
    category: 'Fragrance Education',
    readTime: '3 min read',
    content: [
      {
        type: 'p',
        text: 'You spent your money on a fragrance you love — now make it work a full day. How long a scent lasts depends less on the bottle and more on how you apply it, where you store it, and how your skin behaves. Here are nine practical tips.',
      },
      {
        type: 'ul',
        items: [
          'Apply right after a shower, while your skin is still warm and slightly damp — pores are open and scent clings better.',
          'Moisturise first. Fragrance evaporates faster from dry skin; an unscented lotion gives it something to bind to.',
          'Target pulse points: wrists, neck, behind the ears, inner elbows. These spots radiate heat and push the scent out.',
          'Do not rub your wrists together. Friction crushes the top notes and shortens the fragrance.',
          'Spray from about 15-20 cm away so the mist settles evenly instead of pooling in one spot.',
          'Do not overspray "on the fabric" as a habit — oils can stain light clothing. One spray on the collar line is enough.',
          'Store bottles away from sunlight, heat, and bathroom humidity. Light and heat degrade fragrance oils quickly.',
          'Try layering: apply an attar first, then a matching perfume spray over it. Oils anchor sprays beautifully.',
          'Carry a 3ml tester for touch-ups. At PKR 250 for most testers, it is the cheapest longevity upgrade you can buy.',
        ],
      },
      {
        type: 'p',
        text: 'Some families genuinely last longer than others. Woody and amber-heavy scents like [Sauvage Elixir By Dior](/shop/sauvage-elixir-by-dior) and [Imperial Valeey By Gissah](/shop/imperial-valeey-by-gissah) are known for their staying power, while fresh citruses like [Azzaro Chrome Extreme By Azzaro](/shop/azzaro-chrome-extreme-by-azzaro) are lighter by design — perfect for office wear, but expect to re-apply by evening.',
      },
      {
        type: 'p',
        text: 'The honest summary: no trick turns a light fragrance into a beast-mode one. But the right application routine will consistently get you two to four extra hours from almost anything in your collection.',
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}