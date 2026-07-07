/** Tunable thresholds for meaningful-read detection (not too lenient, not too strict). */
export const MEANINGFUL_READ_CONFIG = {
  /** Stop counting active time after this much inactivity. */
  IDLE_TIMEOUT_MS: 45_000,
  TICK_MS: 1_000,
  /** Minimum focused time for 1–2 page documents. */
  MIN_ACTIVE_SECONDS_SHORT: 90,
  /** Minimum focused time for 3+ page documents. */
  MIN_ACTIVE_SECONDS_LONG: 120,
  SHORT_DOC_MAX_PAGES: 2,
  /** Page counts as "seen" when at least this fraction is visible. */
  PAGE_VISIBLE_RATIO: 0.25,
  /** Per-page dwell required for multi-page depth checks. */
  PAGE_DWELL_SECONDS: 3,
  /** Single-page docs: cumulative dwell on that page. */
  SINGLE_PAGE_MIN_DWELL: 40,
  /** Reaching the last page: cumulative dwell on the final page. */
  LAST_PAGE_MIN_DWELL: 5,
  /** Fraction of pages that must meet PAGE_DWELL_SECONDS (for 3+ page docs). */
  DEPTH_RATIO: 0.5,
} as const;

export function countPagesWithMinDwell(
  pageDwellSeconds: ReadonlyMap<number, number>,
  minDwell: number
): number {
  let count = 0;
  for (const sec of pageDwellSeconds.values()) {
    if (sec >= minDwell) count++;
  }
  return count;
}

/**
 * Returns true when the reader has spent enough focused time and covered enough
 * of the document. Requires `activeSeconds` to only count tab-visible, non-idle time.
 */
export function isMeaningfulReadComplete(
  numPages: number,
  activeSeconds: number,
  pageDwellSeconds: ReadonlyMap<number, number>
): boolean {
  if (numPages <= 0) return false;

  const {
    MIN_ACTIVE_SECONDS_SHORT,
    MIN_ACTIVE_SECONDS_LONG,
    SHORT_DOC_MAX_PAGES,
    SINGLE_PAGE_MIN_DWELL,
    PAGE_DWELL_SECONDS,
    LAST_PAGE_MIN_DWELL,
    DEPTH_RATIO,
  } = MEANINGFUL_READ_CONFIG;

  const minActive =
    numPages <= SHORT_DOC_MAX_PAGES ? MIN_ACTIVE_SECONDS_SHORT : MIN_ACTIVE_SECONDS_LONG;
  if (activeSeconds < minActive) return false;

  if (numPages === 1) {
    return (pageDwellSeconds.get(1) ?? 0) >= SINGLE_PAGE_MIN_DWELL;
  }

  if (numPages === 2) {
    const dwell1 = pageDwellSeconds.get(1) ?? 0;
    const dwell2 = pageDwellSeconds.get(2) ?? 0;
    return dwell1 >= PAGE_DWELL_SECONDS && dwell2 >= PAGE_DWELL_SECONDS;
  }

  const requiredPages = Math.ceil(numPages * DEPTH_RATIO);
  const pagesWithDwell = countPagesWithMinDwell(pageDwellSeconds, PAGE_DWELL_SECONDS);
  const lastPageDwell = pageDwellSeconds.get(numPages) ?? 0;

  return pagesWithDwell >= requiredPages || lastPageDwell >= LAST_PAGE_MIN_DWELL;
}
