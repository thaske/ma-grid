import { XP_COLORS } from "@/utils/constants";

/**
 * Helper function to create an HTML element with optional className(s) and textContent
 */
export function createElement(
  tag: string,
  className?: string | string[],
  content?: string
): HTMLElement {
  const element = document.createElement(tag);
  if (className) {
    if (Array.isArray(className)) {
      element.className = className.join(" ");
    } else {
      element.className = className;
    }
  }
  if (content) {
    element.textContent = content;
  }
  return element;
}

/**
 * Calculate XP color based on thresholds
 */
export function getXpColor(xp: number): string {
  if (xp === 0) return XP_COLORS.NONE;
  if (xp < 15) return XP_COLORS.LOW;
  if (xp < 30) return XP_COLORS.MEDIUM;
  return XP_COLORS.HIGH;
}

/**
 * Get XP level class name based on thresholds
 */
export function getXpLevel(xp: number): string {
  if (xp === 0) return "none";
  if (xp < 15) return "low";
  if (xp < 30) return "medium";
  return "high";
}
