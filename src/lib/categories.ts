import {
  Droplet,
  Fish,
  Anchor,
  Shell,
  Waves,
  Plus,
  Fuel,
  Ship,
  Snowflake,
  Wrench,
  Ruler,
  Bug,
  UtensilsCrossed,
  Home,
  HeartPulse,
  GraduationCap,
  PartyPopper,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import {
  FishingExpenseCategory,
  HomeExpenseCategory,
  SaleCategory,
} from "./types";

export const saleCategoryMeta: Record<
  SaleCategory,
  { label: string; icon: LucideIcon }
> = {
  ostra: { label: "Ostra", icon: Droplet },
  caranguejo: { label: "Caranguejo", icon: Anchor },
  peixe: { label: "Peixe", icon: Fish },
  marisco: { label: "Marisco", icon: Shell },
  sururu: { label: "Sururu", icon: Waves },
  outros: { label: "Outros", icon: Plus },
};

export const fishingExpenseMeta: Record<
  FishingExpenseCategory,
  { label: string; icon: LucideIcon }
> = {
  combustivel: { label: "Combustível", icon: Fuel },
  transporte: { label: "Transporte", icon: Ship },
  gelo: { label: "Gelo", icon: Snowflake },
  equipamentos: { label: "Equipamentos", icon: Wrench },
  manutencao: { label: "Manutenção", icon: Ruler },
  iscas: { label: "Iscas", icon: Bug },
  outros: { label: "Outros", icon: MoreHorizontal },
};

export const homeExpenseMeta: Record<
  HomeExpenseCategory,
  { label: string; icon: LucideIcon }
> = {
  alimentacao: { label: "Alimentação", icon: UtensilsCrossed },
  moradia: { label: "Moradia", icon: Home },
  saude: { label: "Saúde", icon: HeartPulse },
  educacao: { label: "Educação", icon: GraduationCap },
  lazer: { label: "Lazer", icon: PartyPopper },
  outros: { label: "Outros", icon: MoreHorizontal },
};
