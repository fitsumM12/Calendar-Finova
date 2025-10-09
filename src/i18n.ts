import type { Locale } from "./types";

export const monthNames: Record<Locale, string[]> = {
  en: [
    "Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit","Megabit",
    "Miyazia","Ginbot","Sene","Hamle","Nehasse","Pagume"
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

export const weekdayNames: Record<
  Locale,
  { short: string[]; long: string[]; narrow: string[] }
> = {
  en: {
    short: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    long: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    narrow: ["M","T","W","T","F","S","S"],
  },
  am: {
    short: ["ሰኞ","ማክሰ","ረቡ","ሐሙ","ዓርብ","ቅዳ","እሑ"],
    long: ["ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ","እሑድ"],
    narrow: ["ሰ","ማ","ረ","ሐ","ዓ","ቅ","እ"],
  },
  om: {
    short: ["Wiix","Kibx","Roob","Kami","Jima","Sanb","Dilb"],
    long: ["Wiixata","Kibxata","Roobii","Kamiisa","Jimaata","Sanbata","Dilbata"],
    narrow: ["W","K","R","K","J","S","D"],
  },
  so: {
    short: ["Isn","Tal","Arb","Kha","Jim","Sab","Axa"],
    long: ["Isniin","Talaado","Arbaco","Khamiis","Jimco","Sabti","Axad"],
    narrow: ["I","T","A","K","J","S","A"],
  },
};
