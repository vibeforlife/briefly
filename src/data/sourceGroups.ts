// src/data/sourceGroups.ts

export type SourceGroup = "all" | "big" | "independent";

export const BIG_OUTLET_DOMAINS = [
  "bbc.com",
  "bbc.co.uk",
  "reuters.com",
  "apnews.com",
  "cnn.com",
  "foxnews.com",
  "theguardian.com",
  "nytimes.com",
  "washingtonpost.com",
  "aljazeera.com",
  "hindustantimes.com",
  "cbc.ca",
  "globalnews.ca",
  "bloomberg.com",
  "ft.com",
  "wsj.com",
];

// Independent / low-bias / non-profit and alternative outlets.
export const INDEPENDENT_DOMAINS = [
  // Previously added general independent outlets
  "theintercept.com",
  "reason.com",
  "jacobin.com",
  "zerohedge.com",
  "commondreams.org",
  "theepochtimes.com",
  "truthout.org",
  "mintpressnews.com",
  "thedailybeast.com",

  // Low-bias / non-profit / independent recommendations
  "apnews.com",       // Associated Press [web:122][web:132]
  "reuters.com",      // Reuters [web:122][web:123]
  "propublica.org",   // ProPublica [web:131]
  "npr.org",          // NPR [web:123][web:127]
  "pbs.org",          // PBS NewsHour [web:123][web:127]

  // Middle East–focused outlets you requested
  "haaretz.com",              // Haaretz
  "electronicintifada.net",   // Electronic Intifada
  "mondoweiss.net",           // Mondoweiss
  "maannews.com",             // Ma'an News Agency
  "palestinechronicle.com",   // Palestine Chronicle
  "english.pnn.ps",           // Palestine News Network
  "972mag.com",               // +972 Magazine
  "middleeastmonitor.com",    // Middle East Monitor (MEMO)
  "imeu.org",                 // Institute for Middle East Understanding (IMEU)
  "wrmea.org",                // Washington Report on Middle East Affairs (WRMEA)
  "fmep.org",                 // Foundation for Middle East Peace (FMEP)
];

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function matchesDomain(url: string, domains: string[]): boolean {
  const domain = getDomainFromUrl(url);
  return domains.some((d) => domain === d || domain.endsWith("." + d));
}
