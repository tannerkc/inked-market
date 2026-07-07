/**
 * Smooth-scroll the studio site to a section by data-section id.
 * Works inside the builder's overflow container and on the public page.
 * Extra ids act as fallbacks (first section that exists wins).
 */
export function scrollToBuilderSection(...sectionIds: string[]): void {
  const root = document.querySelector("[data-builder-root]");
  if (!root) return;
  let el: Element | null = null;
  for (const id of sectionIds) {
    el = root.querySelector(`[data-section="${id}"], [data-builder-section="${id}"]`);
    if (el) break;
  }
  if (!el) return;
  const scrollContainer =
    root.closest<HTMLElement>("[class*='overflow-y-auto']") ?? root.parentElement;
  if (!scrollContainer) return;
  const containerRect = scrollContainer.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  scrollContainer.scrollBy({ top: elRect.top - containerRect.top, behavior: "smooth" });
}
