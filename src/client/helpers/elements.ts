export const setElementAttributes = (
  el: Element,
  attrs: Record<string, string | number>
) =>
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value as string);
  });

export const createSvgElement = (
  type: keyof SVGElementTagNameMap,
  attrs?: Record<string, string | number>
) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", type);
  if (attrs) setElementAttributes(el, attrs);
  return el;
};
