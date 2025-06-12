import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languages = [
  "en",
  "es",
  "pt",
  "ja",
  "zh",
  "zh-TW",
  "tr",
  "ko",
  "fr",
  "nl",
  "de",
  "ar",
];

// Create public/locales directory if it doesn't exist
const publicLocalesDir = path.join(__dirname, "../public/locales");
if (!fs.existsSync(publicLocalesDir)) {
  fs.mkdirSync(publicLocalesDir, { recursive: true });
}

// Copy translation files for each language
languages.forEach((lang) => {
  const langDir = path.join(publicLocalesDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  const sourceFile = path.join(
    __dirname,
    `../src/i18n/translations/${lang}.json`
  );
  const targetFile = path.join(langDir, "translation.json");

  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`Copied ${lang} translations to public directory`);
  } else {
    console.warn(`Warning: No translation file found for ${lang}`);
  }
});
