import React from 'react';
import {
  Flame,
  Sparkles,
  Zap,
  Cross,
  Shield,
  Wand2,
  Target,
  CircleDot,
  Eye,
  Activity,
  type LucideIcon,
} from 'lucide-react';

export const SPELL_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Zap,
  Cross,
  Shield,
  Wand2,
  Target,
  CircleDot,
  Eye,
  Activity,
};

export function getSpellIconComponent(name?: string): LucideIcon {
  if (!name) return Sparkles;
  return SPELL_ICONS[name] ?? Sparkles;
}

export function renderSpellIcon(name?: string, size = 16, className?: string): React.ReactElement {
  const IconComponent = getSpellIconComponent(name);
  return <IconComponent size={size} className={className} />;
}

