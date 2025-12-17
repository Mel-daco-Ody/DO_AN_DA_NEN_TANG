// App Constants - Centralized configuration values
export const BREAKPOINTS = {
  TABLET: 1024,
  MOBILE_LARGE: 600,
} as const;

export const TIMEOUTS = {
  CONTROLS_HIDE: 3000,
  API_TIMEOUT: 10000,
  SEARCH_DEBOUNCE: 300,
} as const;

export const GRID_CONFIG = {
  TABLET_COLUMNS: 3,
  MOBILE_LARGE_COLUMNS: 2,
  MOBILE_COLUMNS: 2,
} as const;

export const PAGINATION = {
  RECENT_ITEMS_LIMIT: 4,
  HERO_SLIDES_LIMIT: 3,
  FEATURED_MOVIES_LIMIT: 3,
  TRENDING_MOVIES_LIMIT: 5,
} as const;

export const FILTER_DEFAULTS = {
  GENRE: 'Tất cả',
  YEAR: 'Tất cả',
  STUDIO: 'Tất cả',
} as const;

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const Z_INDEX = {
  HEADER: 1000,
  MODAL: 2000,
  FLOATING_BUTTON: 1500,
} as const;

