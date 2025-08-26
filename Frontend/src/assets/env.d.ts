export {};

declare global {
  interface Window {
    env?: {
      API_URL?: string;
      ORIGENES_REDIRECT?: string[]
    }
  }
}