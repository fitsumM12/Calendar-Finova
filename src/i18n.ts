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
    short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    long: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
  },
  am: {
    short: ["እሑ", "ሰኞ", "ማክሰ", "ረቡ", "ሐሙ", "ዓርብ", "ቅዳ"],
    long: [
      "እሑድ",
      "ሰኞ",
      "ማክሰኞ",
      "ረቡዕ",
      "ሐሙስ",
      "ዓርብ",
      "ቅዳሜ",
    ],
    narrow: ["እ", "ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ"],
  },
  om: {
    short: ["Dilb", "Wiix", "Kibx", "Roob", "Kami", "Jima", "Sanb"],
    long: [
      "Dilbata",
      "Wiixata",
      "Kibxata",
      "Roobii",
      "Kamiisa",
      "Jimaata",
      "Sanbata",
    ],
    narrow: ["D", "W", "K", "R", "K", "J", "S"],
  },
  so: {
    short: ["Axa", "Isn", "Tal", "Arb", "Kha", "Jim", "Sab"],
    long: [
      "Axad",
      "Isniin",
      "Talaado",
      "Arbaco",
      "Khamiis",
      "Jimco",
      "Sabti",
    ],
    narrow: ["A", "I", "T", "A", "K", "J", "S"],
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
