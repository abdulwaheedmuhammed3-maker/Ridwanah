export interface LearningVideo {
  id: string;
  title: string;
  summary: string;
  category: "Hand hygiene" | "Infection prevention";
  publisher: string;
  publishedAt: string;
  sourceUrl: string;
  embedId: string;
}

export const learningVideos: LearningVideo[] = [
  {
    id: "who-handwashing-soap-water",
    title: "WHO: How to handwash with soap and water",
    summary: "A practical demonstration of the steps used to clean hands with soap and water, including the areas that are easy to miss.",
    category: "Hand hygiene",
    publisher: "World Health Organization",
    publishedAt: "20 October 2015",
    sourceUrl: "https://www.youtube.com/watch?v=3PmVJQUCm4E",
    embedId: "3PmVJQUCm4E"
  },
  {
    id: "who-world-hand-hygiene-day-2024",
    title: "Why does sharing hand-hygiene knowledge still matter?",
    summary: "A WHO recording for World Hand Hygiene Day 2024 exploring why shared knowledge and training remain important in infection prevention.",
    category: "Infection prevention",
    publisher: "World Health Organization",
    publishedAt: "6 May 2024",
    sourceUrl: "https://www.youtube.com/watch?v=mR8U6OK-cEk",
    embedId: "mR8U6OK-cEk"
  }
];
