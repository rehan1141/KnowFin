/* eslint-disable react/only-export-components */
import React from 'react';
import {
  Utensils,
  Car,
  House,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Gamepad2,
  Tv,
  Plane,
  Sparkles,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  RotateCcw,
  Coins,
  Folder,
  Tag,
  CreditCard,
  Building,
  Coffee,
  Fuel,
  Shield,
  ArrowLeftRight,
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  House,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Gamepad2,
  Tv,
  Plane,
  Sparkles,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  RotateCcw,
  Coins,
  Folder,
  Tag,
  CreditCard,
  Building,
  Coffee,
  Fuel,
  Shield,
  ArrowLeftRight,
};

export type CategoryPaletteFamily = 'coral' | 'cobalt' | 'amber' | 'sage' | 'lavender' | 'stone';

export interface CategoryPaletteTokens {
  family: CategoryPaletteFamily;
  hex: string;
  tintClass: string;
  bgRgba: string;
  textHex: string;
  borderRgba: string;
}

export const CATEGORY_THEMES: Record<CategoryPaletteFamily, CategoryPaletteTokens> = {
  coral: {
    family: 'coral',
    hex: '#E97962',
    tintClass: 'kf-tint-coral',
    bgRgba: 'rgba(233, 121, 98, 0.10)',
    textHex: '#B03A24',
    borderRgba: 'rgba(233, 121, 98, 0.22)',
  },
  cobalt: {
    family: 'cobalt',
    hex: '#4778E5',
    tintClass: 'kf-tint-cobalt',
    bgRgba: 'rgba(71, 120, 229, 0.10)',
    textHex: '#2953B2',
    borderRgba: 'rgba(71, 120, 229, 0.22)',
  },
  amber: {
    family: 'amber',
    hex: '#D99A37',
    tintClass: 'kf-tint-amber',
    bgRgba: 'rgba(217, 154, 55, 0.12)',
    textHex: '#8C5C15',
    borderRgba: 'rgba(217, 154, 55, 0.25)',
  },
  sage: {
    family: 'sage',
    hex: '#4C9B79',
    tintClass: 'kf-tint-sage',
    bgRgba: 'rgba(76, 155, 121, 0.10)',
    textHex: '#28664D',
    borderRgba: 'rgba(76, 155, 121, 0.22)',
  },
  lavender: {
    family: 'lavender',
    hex: '#8B79C6',
    tintClass: 'kf-tint-lavender',
    bgRgba: 'rgba(139, 121, 198, 0.12)',
    textHex: '#5B4896',
    borderRgba: 'rgba(139, 121, 198, 0.25)',
  },
  stone: {
    family: 'stone',
    hex: '#20251F',
    tintClass: 'bg-stone-100 text-stone-800 border border-stone-200',
    bgRgba: 'rgba(32, 37, 31, 0.08)',
    textHex: '#20251F',
    borderRgba: 'rgba(32, 37, 31, 0.15)',
  },
};

const ICON_TO_THEME_FAMILY: Record<string, CategoryPaletteFamily> = {
  Utensils: 'coral',
  Coffee: 'coral',
  Car: 'cobalt',
  Fuel: 'cobalt',
  Plane: 'cobalt',
  ArrowLeftRight: 'cobalt',
  House: 'amber',
  Home: 'amber',
  Receipt: 'amber',
  Building: 'amber',
  CreditCard: 'amber',
  RotateCcw: 'amber',
  Briefcase: 'sage',
  Coins: 'sage',
  TrendingUp: 'sage',
  ShoppingBag: 'lavender',
  HeartPulse: 'lavender',
  Gamepad2: 'lavender',
  Tv: 'lavender',
  Sparkles: 'lavender',
  GraduationCap: 'lavender',
  Laptop: 'lavender',
  Gift: 'lavender',
  Shield: 'lavender',
  Folder: 'stone',
  Tag: 'stone',
};

/**
 * Returns the Lucide component corresponding to an icon name string, with 'Folder' as fallback.
 */
export const getCategoryIcon = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Folder;
  return CATEGORY_ICON_MAP[iconName] || Folder;
};

/**
 * Deterministically resolves the palette theme for any given category icon or custom hex.
 *
 * Custom Color Rule:
 * - If `customColor` directly matches one of our 5 approved palette family hex codes, that theme is used.
 * - For solid squircle backgrounds, an arbitrary custom hex can be rendered cleanly with white text.
 * - For tinted surfaces, arbitrary custom hexes cannot safely generate calibrated contrast-checked
 *   tints at runtime without precomputed tokens; in such cases, the category's standard icon theme is
 *   used to guarantee high contrast and aesthetic consistency.
 */
export const getCategoryTheme = (
  iconName?: string | null,
  customColor?: string | null
): CategoryPaletteTokens => {
  if (customColor) {
    const matchingKey = (Object.keys(CATEGORY_THEMES) as CategoryPaletteFamily[]).find(
      (k) => CATEGORY_THEMES[k].hex.toLowerCase() === customColor.toLowerCase()
    );
    if (matchingKey) return CATEGORY_THEMES[matchingKey];
  }
  const family = (iconName && ICON_TO_THEME_FAMILY[iconName]) || 'stone';
  return CATEGORY_THEMES[family];
};

export interface CategoryIconProps {
  iconName?: string | null;
  className?: string;
  color?: string | null;
  variant?: 'raw' | 'squircle' | 'tinted';
  size?: 'sm' | 'md' | 'lg';
  /**
   * If true or if onClick is supplied, applies micro-interaction lift cues.
   * If embedded inside a parent <button> or interactive card, leave interactive false to avoid nested button semantics.
   */
  interactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Primary icon component for categories.
 * When variant is 'raw' (default), renders the icon SVG directly.
 * When variant is 'squircle' or 'tinted', renders within an expressive, accessible squircle container.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-4 h-4',
  color,
  variant = 'raw',
  size = 'md',
  interactive = false,
  onClick,
}) => {
  const IconComp = getCategoryIcon(iconName);

  if (variant === 'raw') {
    return <IconComp className={className} aria-hidden="true" />;
  }

  const theme = getCategoryTheme(iconName, color);
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const isInteractive = interactive || Boolean(onClick);

  if (variant === 'squircle') {
    return (
      <div
        className={`kf-squircle ${sizeClasses} text-white shrink-0 shadow-2xs ${
          isInteractive ? 'cursor-pointer hover:shadow-xs' : ''
        } ${className}`}
        style={{ backgroundColor: color || theme.hex }}
        aria-hidden="true"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <IconComp className={iconSizeClasses} />
      </div>
    );
  }

  // variant === 'tinted'
  // Notice: For tinted surfaces, we strictly use theme.tintClass to ensure contrast and harmony
  return (
    <div
      className={`kf-squircle ${sizeClasses} shrink-0 ${theme.tintClass} ${
        isInteractive ? 'cursor-pointer hover:shadow-2xs' : ''
      } ${className}`}
      aria-hidden="true"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <IconComp className={iconSizeClasses} />
    </div>
  );
};

/**
 * Semantic helper for rendering a category squircle directly.
 */
export const CategorySquircle: React.FC<Omit<CategoryIconProps, 'variant'>> = (props) => {
  return <CategoryIcon {...props} variant="squircle" />;
};
