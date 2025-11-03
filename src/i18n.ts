import type { Locale } from "./types";

// Month names per locale
export const monthNames: Record<Locale, string[]> = {
  en: [
    "September", "October", "November", "December", 
    "January", "February", "March", 
    "April", "May", "June", 
    "July", "August", "Pagume"
  ],
  am: [
    "መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት",
    "ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜን"
  ],
  om: [
    "Fulbaana","Onkololeessa","Sadaasa","Muddee","Amajjii","Guraandhala",
    "Bitootessa","Ebla","Caamsa","Waxabajjii","Adoolessa","Hagayya","Pagumee"
  ],
  so: [
    "Sebteembar","Oktoobar","Noofembar","Diseembar","Janaayo","Febraayo",
    "Maarso","Abriil","Maajo","Juun","Luuliyo","Agoosto","Pagume"
  ],
};
// Weekday names per locale (starting from Sunday)
export const weekdayNames: Record<
  Locale,
  { short: string[]; long: string[]; narrow: string[] }
> = {
  en: {
    short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    long: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    narrow: ["M", "T", "W", "T", "F", "S", "S"],
  },
  am: {
    short: ["ሰኞ", "ማክሰ", "ረቡ", "ሐሙ", "ዓርብ", "ቅዳ", "እሑ"],
    long: [
      "ሰኞ",
      "ማክሰኞ",
      "ረቡዕ",
      "ሐሙስ",
      "ዓርብ",
      "ቅዳሜ",
      "እሑድ",
    ],
    narrow: ["ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ", "እ"],
  },
  om: {
    short: ["Wiix", "Kibx", "Roob", "Kami", "Jima", "Sanb", "Dilb"],
    long: [
      "Wiixata",
      "Kibxata",
      "Roobii",
      "Kamiisa",
      "Jimaata",
      "Sanbata",
      "Dilbata",
    ],
    narrow: ["W", "K", "R", "K", "J", "S", "D"],
  },
  so: {
    short: ["Isn", "Tal", "Arb", "Kha", "Jim", "Sab", "Axa"],
    long: [
      "Isniin",
      "Talaado",
      "Arbaco",
      "Khamiis",
      "Jimco",
      "Sabti",
      "Axad",
    ],
    narrow: ["I", "T", "A", "K", "J", "S", "A"],
  },
};


// Mapping Ethiopian month names to English
const ethToEngMonthMap: Record<string, string> = {
  Meskerem: "September",
  Tikimt: "October",
  Hidar: "November",
  Tahsas: "December",
  Tir: "January",
  Yekatit: "February",
  Megabit: "March",
  Miyazia: "April",
  Ginbot: "May",
  Sene: "June",
  Hamle: "July",
  Nehasse: "August",
  Pagume: "Pagume", // Extra month
};

// Helper function to convert Ethiopian month to English
export function convertEthiopianMonthToEnglish(month: string): string {
  return ethToEngMonthMap[month] || month;
}
