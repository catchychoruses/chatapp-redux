declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN_KEY: string;
    }
  }
}

export {};
