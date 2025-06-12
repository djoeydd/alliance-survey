interface Intl {
  supportedValuesOf(key: "timeZone"): string[];
}

declare global {
  interface Window {
    Intl: typeof Intl;
  }
}
