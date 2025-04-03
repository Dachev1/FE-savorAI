/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_AUTH_REDIRECT_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
