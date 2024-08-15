/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PAYLOAD_REST_ENDPOINT: string;
    readonly VITE_PAYLOAD_AUTH_COLLECTION: string;
    readonly VITE_PAYLOAD_SOCKET_ENDPOINT: string;
    // more env variables...
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}