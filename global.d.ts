export {};

// Extend Window interface to include the Facebook Pixel function
declare global {
  interface Window {
    /** Facebook Pixel function */
    fbq?: (...args: any[]) => void;
  }
} 