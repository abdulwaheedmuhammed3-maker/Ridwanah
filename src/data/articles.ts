export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ArticleSource {
  title: string;
  organisation: string;
  url: string;
  sourceDate: string;
}

export interface HealthArticle {
  slug: string;
  title: string;
  description: string;
  category: "Prevention" | "Movement" | "Nutrition";
  categoryLabel: string;
  readTime: string;
  publishedAt: string;
  medicalReview: "Pending qualified medical review";
  featured?: boolean;
  takeaways: string[];
  sections: ArticleSection[];
  sources: ArticleSource[];
}

export const articles: HealthArticle[] = [
  {
    slug: "handwashing-when-and-how",
    title: "Handwashing: when and how to clean your hands",
    description: "A practical guide to the moments that matter, the steps to follow, and what to use when soap and water are not available.",
    category: "Prevention",
    categoryLabel: "Everyday prevention",
    readTime: "5 min read",
    publishedAt: "20 November 2026",
    medicalReview: "Pending qualified medical review",
    featured: true,
    takeaways: [
      "Wash with plain soap and clean water at important moments, especially around food and after using the toilet.",
      "Rub all areas of your hands, including between fingers and under nails.",
      "When hands are not visibly dirty and soap and water are unavailable, an alcohol-based hand rub with at least 60% alcohol is an option."
    ],
    sections: [
      {
        heading: "Why clean hands matter",
        paragraphs: [
          "Hands touch food, faces, shared surfaces and other people throughout the day. Germs can move from hands to the mouth, nose or eyes, or onto objects that other people touch.",
          "Cleaning hands with soap and water helps remove dirt, germs and substances from the skin. It is a simple everyday practice that can reduce the spread of some infections."
        ]
      },
      {
        heading: "When should you wash your hands?",
        paragraphs: ["The World Health Organization highlights five important moments for hand hygiene in community settings:"],
        bullets: [
          "Before preparing food.",
          "Before eating or feeding another person.",
          "After using the toilet or handling faeces.",
          "After coughing, sneezing or blowing your nose.",
          "Whenever your hands are visibly dirty."
        ]
      },
      {
        heading: "How to wash your hands",
        paragraphs: [
          "Use clean, running water and plain soap. Rub your hands together to make a lather and cover the palms, backs of the hands, between the fingers, thumbs and areas around and under the nails.",
          "Continue scrubbing for about 20 seconds, then rinse thoroughly under clean, running water. Dry your hands with a clean towel or allow them to air-dry."
        ],
        bullets: [
          "Wet your hands with clean, running water and apply soap.",
          "Rub all surfaces of both hands, including between your fingers and under your nails.",
          "Keep rubbing for about 20 seconds.",
          "Rinse well with clean, running water.",
          "Dry your hands completely with a clean towel or air-dry them."
        ]
      },
      {
        heading: "What if soap and water are not available?",
        paragraphs: [
          "When hands are not visibly dirty and soap and water are not available, an alcohol-based hand rub containing at least 60% alcohol can be used. Follow the product instructions and rub it over all hand surfaces until dry.",
          "Hand rub is not a replacement for washing visibly dirty hands. Use soap and clean water when you can."
        ]
      },
      {
        heading: "Make hand hygiene part of your routine",
        paragraphs: [
          "Keep soap and a reliable handwashing option somewhere convenient at home, school or work. Make handwashing part of routines around meals, toilet use and caring for someone who is ill.",
          "Children may need help and reminders. Adults can make the habit easier to learn by practising it consistently."
        ]
      }
    ],
    sources: [
      {
        title: "New guidelines on community hand hygiene to help governments reduce the spread of infectious diseases",
        organisation: "World Health Organization",
        url: "https://www.who.int/news/item/15-10-2025-new-guidelines-on-community-hand-hygiene-to-help-governments-reduce-the-spread-of-infectious-diseases",
        sourceDate: "15 October 2025"
      },
      {
        title: "About Handwashing",
        organisation: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/clean-hands/about/",
        sourceDate: "16 February 2024"
      }
    ]
  },
  {
    slug: "physical-activity-for-adults",
    title: "Moving more: physical activity for adults",
    description: "Understand the weekly activity recommendations for adults and discover practical ways to add more movement to everyday life.",
    category: "Movement",
    categoryLabel: "Movement & wellbeing",
    readTime: "5 min read",
    publishedAt: "20 November 2026",
    medicalReview: "Pending qualified medical review",
    featured: true,
    takeaways: [
      "Adults should aim for 150–300 minutes of moderate-intensity aerobic activity each week, or the vigorous-intensity equivalent.",
      "Muscle-strengthening activities are recommended on at least two days each week.",
      "Some movement is better than none; people who are inactive can begin with small amounts and build gradually."
    ],
    sections: [
      {
        heading: "What counts as physical activity?",
        paragraphs: [
          "Physical activity is movement that uses energy. It includes more than planned workouts: brisk walking, cycling, dancing, some household tasks, active play and sport can all contribute.",
          "The intensity depends on how hard your body is working. During moderate activity, breathing and heart rate increase but conversation is still possible. Vigorous activity makes breathing harder and conversation more difficult."
        ]
      },
      {
        heading: "How much activity should adults aim for?",
        paragraphs: [
          "For adults aged 18–64, the World Health Organization recommends at least 150–300 minutes of moderate-intensity aerobic physical activity each week, or at least 75–150 minutes of vigorous-intensity activity, or an equivalent combination.",
          "Adults should also do muscle-strengthening activities that work the major muscle groups on two or more days each week."
        ]
      },
      {
        heading: "Start where you are",
        paragraphs: [
          "You do not have to begin with a demanding exercise routine. If you are not active now, start with manageable amounts and gradually increase how often, how long and how hard you move.",
          "For example, you might take a short walk, choose stairs when practical, dance to music, cycle for a local journey or build movement breaks into a long period of sitting. Choose activities that are accessible and realistic for your circumstances."
        ]
      },
      {
        heading: "Remember strength and time spent sitting",
        paragraphs: [
          "Aerobic activity is only one part of movement. Activities that strengthen muscles provide additional benefits, so include them across the week where appropriate.",
          "Long periods of sitting can be broken up with movement. Stand, stretch or walk for a short while when practical rather than remaining seated for long uninterrupted periods."
        ]
      },
      {
        heading: "Choose an approach that is safe for you",
        paragraphs: [
          "Your health, mobility, age, pregnancy status, disability and current fitness can affect which activities are suitable. The general recommendations are not a personal exercise prescription.",
          "Speak with a qualified healthcare professional before making major changes when you have a health condition, symptoms during activity, significant mobility limitations or uncertainty about what is safe for you."
        ]
      }
    ],
    sources: [
      {
        title: "Physical activity",
        organisation: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity/",
        sourceDate: "4 November 2026"
      },
      {
        title: "WHO guidelines on physical activity and sedentary behaviour: at a glance",
        organisation: "World Health Organization",
        url: "https://www.who.int/europe/publications/i/item/9789240014886",
        sourceDate: "4 May 2021"
      }
    ]
  },
  {
    slug: "healthy-eating-everyday-basics",
    title: "Healthy eating: everyday basics for a varied diet",
    description: "Explore the principles of a varied diet, everyday food choices, and WHO guidance on fruit, vegetables, salt and free sugars.",
    category: "Nutrition",
    categoryLabel: "Food & nutrition",
    readTime: "6 min read",
    publishedAt: "20 November 2026",
    medicalReview: "Pending qualified medical review",
    featured: true,
    takeaways: [
      "A healthy diet is varied and balanced; it can include different fruits, vegetables, pulses, whole grains and suitable protein foods.",
      "WHO advises people older than 10 years to aim for at least 400 grams of fruit and vegetables each day.",
      "For adults, WHO recommends less than 5 grams of salt per day and limiting free sugars to less than 10% of total energy intake."
    ],
    sections: [
      {
        heading: "There is no single food that does everything",
        paragraphs: [
          "A varied diet includes different foods that provide different nutrients. The World Health Organization describes healthy diets through principles such as adequacy, balance, moderation and diversity.",
          "Depending on availability, culture, budget and personal needs, meals can include vegetables, fruits, beans and other pulses, whole grains, nuts, seeds and suitable sources of protein."
        ]
      },
      {
        heading: "Make variety practical",
        paragraphs: [
          "Think about variety across the day and week rather than expecting every meal to look the same. Foods such as beans, millet, maize, oats, leafy vegetables and seasonal fruit can all be part of a varied pattern of eating.",
          "Fresh produce is useful, but frozen or canned fruit and vegetables can also be options. Check labels for added sugars and excess sodium where relevant."
        ]
      },
      {
        heading: "Fruit and vegetables",
        paragraphs: [
          "WHO advises everyone older than 10 years to aim for at least 400 grams of fruit and vegetables per day. Recommended amounts are lower for younger children and vary by age.",
          "Include a range of colours and types when possible. Whole fruit is often a practical choice; fruit juice can contain significant amounts of free sugars, even when no sugar is added."
        ]
      },
      {
        heading: "Be mindful of salt and free sugars",
        paragraphs: [
          "For adults, WHO recommends limiting salt intake to less than 5 grams a day. Salt can come from packaged foods, snacks, seasonings, stock cubes and salt added during cooking or at the table.",
          "WHO recommends keeping free sugars below 10% of total daily energy intake. Free sugars include sugars added to foods and drinks, as well as sugars naturally present in honey, syrups and fruit juices."
        ]
      },
      {
        heading: "Make changes that fit your circumstances",
        paragraphs: [
          "Small, realistic changes can make a varied eating pattern easier to maintain. You might add a vegetable to a familiar meal, include beans more often, choose water more regularly, or compare food labels when shopping.",
          "Nutritional needs differ across age, pregnancy, illness, allergies, activity levels and other circumstances. Anyone with a medical condition or specific dietary requirement should seek individual guidance from a qualified healthcare professional or registered dietitian."
        ]
      }
    ],
    sources: [
      {
        title: "Healthy diet",
        organisation: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
        sourceDate: "WHO fact sheet, accessed 20 November 2026"
      }
    ]
  }
];