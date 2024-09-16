declare module 'node-localstorage' {
  export class LocalStorage {
    constructor(location: string);
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(n: number): string | null;
    length: number;
  }
}
