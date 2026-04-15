/**
 * Shared builder utilities for CSS variable handling.
 * Eliminates the duplicated reduce/forEach patterns across preview components.
 */

/**
 * Converts a resolved CSS vars record to a React inline style object.
 * Used by preview canvas components that apply theme vars via `style` prop.
 */
export function cssVarsToStyle(
  vars: Record<string, string> | object,
): Record<string, string> {
  return Object.entries(vars as Record<string, string>).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {},
  );
}

/**
 * Syncs resolved CSS vars to a DOM element as custom properties.
 * Used by builder shells that portal overlays and need them to inherit theme vars.
 */
export function syncCssVarsToElement(
  el: HTMLElement,
  vars: Record<string, string> | object,
): void {
  Object.entries(vars as Record<string, string>).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
}
