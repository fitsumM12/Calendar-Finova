# ethiopian-calendar-xplat  

![npm](https://img.shields.io/npm/v/ethiopian-calendar-xplat?color=blue) 
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ethiopian-calendar-xplat) 
![license](https://img.shields.io/npm/l/ethiopian-calendar-xplat) 
![vitest](https://img.shields.io/badge/tests-passing-brightgreen)

📅 Cross-platform **Ethiopian (Ethiopic) calendar** conversion and formatting with **internationalization (i18n)**:

- 🌍 **Supported Languages**:
  - **Amharic (am)**
  - **Afaan Oromo (om)**
  - **Somali (so)**
  - **English (en, transliterations)**

✅ Works in:
- Browser  
- Node.js  
- Deno  
- React Native  

⚡ Built with **TypeScript**, tested with **Vitest**, and bundled via **tsup**.

---

## 📦 Installation

```bash
npm i ethiopian-calendar-xplat
```

---

## 📖 Documentation

👉 [Read the full docs on npm](https://www.npmjs.com/package/ethiopian-calendar-xplat)

---

## 🚀 Features

- Convert between **Ethiopian ↔ Gregorian** dates  
- Format dates with **localization (i18n)**  
- Lightweight and **tree-shakable**  
- Zero external dependencies  

---

## 🧑‍💻 Example Usage

```ts
import { toEthiopian, formatDate } from "ethiopian-calendar-xplat";

// Convert Gregorian → Ethiopian
const etDate = toEthiopian(new Date(2025, 7, 16)); 
console.log(etDate); // { year: 2017, month: 12, day: 10 }

// Format in Amharic
console.log(formatDate(etDate, { locale: "am" }));
// ፳፻፲፯ ነሐሴ ፲
```

---

## 📜 License

[MIT](./LICENSE)
