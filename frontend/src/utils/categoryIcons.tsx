import React from 'react';
import {
  Utensils,
  Car,
  House,
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
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  House,
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
};

export const getCategoryIcon = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Folder;
  return CATEGORY_ICON_MAP[iconName] || Folder;
};

export const CategoryIcon: React.FC<{
  iconName?: string | null;
  className?: string;
}> = ({ iconName, className = 'w-4 h-4' }) => {
  const IconComp = getCategoryIcon(iconName);
  return <IconComp className={className} />;
};
