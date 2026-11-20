export type NewsRegion = "Nigeria" | "Africa" | "Global";

export interface HealthNewsItem {
  slug: string;
  title: string;
  summary: string;
  region: NewsRegion;
  topic: string;
  sourceName: string;
  sourceType: string;
  sourceDate: string;
  contextDate?: string;
  sourceTitle: string;
  sourceUrl: string;
}

export const healthNews: HealthNewsItem[] = [
  {
    slug: "ebola-response-reaching-remote-communities-drc",
    title: "Ebola response in DR Congo faces challenges reaching remote communities",
    summary: "A joint update from WHO and Africa CDC says insecurity, displacement and hard-to-reach communities continue to complicate the response to the Bundibugyo virus outbreak. The statement also describes expanded laboratory capacity, treatment services and community health work. These are figures and conditions reported on the publication date, not a live outbreak dashboard.",
    region: "Africa",
    topic: "Disease response",
    sourceName: "Africa CDC and partners",
    sourceType: "Joint statement",
    sourceDate: "15 November 2026",
    sourceTitle: "Six months on, accessing hard-to-reach communities key to halting Ebola outbreak",
    sourceUrl: "https://africacdc.org/news-item/six-months-on-accessing-hard-to-reach-communities-key-to-halting-ebola-outbreak/"
  },
  {
    slug: "nigeria-national-oral-health-plan-2026-2030",
    title: "Nigeria launches a national oral health plan for 2026–2030",
    summary: "Nigeria’s Federal Ministry of Health announced a new national strategy intended to strengthen oral healthcare, integrate services into primary healthcare and address Noma as a public-health problem. The ministry says the plan is part of a broader effort to make oral health a more visible part of essential healthcare. The announcement followed an event in Abuja on 9 November.",
    region: "Nigeria",
    topic: "Oral health",
    sourceName: "Federal Ministry of Health and Social Welfare",
    sourceType: "Press release",
    sourceDate: "13 November 2026",
    contextDate: "Announcement event: 9 November 2026",
    sourceTitle: "FG Launches National Oral Health Strategic Plan 2026–2030",
    sourceUrl: "https://health.gov.ng/fg-launches-national-oral-health-strategic-plan-2026-2030-targets-elemination-of-noma-integrates-oral-healthcare-into-phc/"
  },
  {
    slug: "nigeria-five-year-lead-poisoning-plan",
    title: "Nigeria announces a five-year plan to prevent lead poisoning",
    summary: "The Federal Ministry of Health says the plan will strengthen prevention, surveillance, regulation and coordination to reduce lead exposure. Its announcement identifies children and pregnant women among groups that are particularly vulnerable. The ministry also points to the need for interventions that address local sources of exposure, rather than relying only on detecting cases.",
    region: "Nigeria",
    topic: "Environmental health",
    sourceName: "Federal Ministry of Health and Social Welfare",
    sourceType: "Press release",
    sourceDate: "13 November 2026",
    contextDate: "Plan launch announced: 21 October 2026",
    sourceTitle: "FG launches five-year strategic plan to eliminate lead poisoning in Nigeria",
    sourceUrl: "https://health.gov.ng/fg-launches-five-year-strategic-plan-to-eliminate-lead-poisoning-in-nigeria/"
  },
  {
    slug: "africa-community-health-workers-plan-2030",
    title: "Africa-wide plan targets stronger community health services by 2030",
    summary: "Nigeria hosted the launch of a continental plan involving 51 African countries and more than 30 partners. The initiative sets a goal of supporting the employment of two million community health workers across Africa by 2030. Nigeria’s stated estimate of 315,000 workers is a planning figure for its needs by 2030, not a count of workers currently in post.",
    region: "Africa",
    topic: "Primary healthcare",
    sourceName: "Federal Ministry of Health and Social Welfare",
    sourceType: "Press release",
    sourceDate: "13 November 2026",
    contextDate: "Plan launch: 30 October 2026",
    sourceTitle: "Nigeria hosts launch of Africa’s Community Health Acceleration Plan",
    sourceUrl: "https://health.gov.ng/nigeria-hosts-launch-of-africas-community-health-acceleration-plan-targets-2-million-workers-by-2030/"
  },
  {
    slug: "who-adolescent-physical-activity-global-estimates",
    title: "WHO report finds one in four adolescents had no active days in the previous week",
    summary: "New WHO global estimates found that one in four adolescents aged 11–17 reported no day in the previous week with at least 60 minutes of moderate-to-vigorous physical activity. The findings draw on surveys from 140 countries and territories. They describe a global pattern and should not be read as a Nigeria-specific estimate.",
    region: "Global",
    topic: "Young people’s health",
    sourceName: "World Health Organization",
    sourceType: "News release",
    sourceDate: "4 November 2026",
    sourceTitle: "One in four adolescents worldwide reported no active days in the previous week",
    sourceUrl: "https://www.who.int/news/item/04-11-2026-one-in-four-adolescents-worldwide-reported-no-active-days-in-the-previous-week"
  }
];
