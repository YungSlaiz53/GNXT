/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  /** Treasury address used by the mint transaction (test‑net address) */
  VITE_TREASURY_ADDRESS: string;

  /** RPC endpoint for Cardano */
  VITE_RPC_URL: string;

  /** Firebase configuration variables */
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
