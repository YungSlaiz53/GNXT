/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_TREASURY_ADDRESS: string;
  // Add other VITE_ variables if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
