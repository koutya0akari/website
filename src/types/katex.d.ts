declare module "katex/dist/contrib/auto-render" {
  const renderMathInElement: (element: HTMLElement, options?: unknown) => void;
  export default renderMathInElement;
}
