export const setElementAttributes = (
  el: Element,
  attrs: Record<string, string>
) =>
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));

export const createSvgElement = (
  type: keyof SVGElementTagNameMap,
  attrs?: Record<string, string>
) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", type);
  if (attrs) setElementAttributes(el, attrs);
  return el;
};
