declare module 'jsdom-global' {
  export default function(html: string): () => void;
}
