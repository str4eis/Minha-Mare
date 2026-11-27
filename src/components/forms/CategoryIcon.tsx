import {
  Anchor,
  CircleHelp,
  Fish,
  Fuel,
  GraduationCap,
  HeartPulse,
  Home,
  Package,
  Shell,
  Smile,
  Snowflake,
  Truck,
  UtensilsCrossed,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  getCategoryIconName,
  type CategoryIconName,
} from "@/lib/domain/category-icons";

type IconComponent = ComponentType<LucideProps>;
type CategoryKind = "venda" | "pesca" | "casa";

function OysterIcon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3c-1 3-6 5-7 10a7 7 0 0 0 14 0c-1-5-6-7-7-10Z" />
      <path d="M12 4v15M9 7c-1 3-3 4-3 7m9-7c1 3 3 4 3 7M8 17l4-3 4 3" />
    </svg>
  );
}

function CrabIcon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 11a4 4 0 0 1 8 0v3a4 4 0 0 1-8 0v-3Z" />
      <path d="M8 12 4 10l-2 2 4 3m10-3 4-2 2 2-4 3M8 9 6 6 4 7m12 2 2-3 2 1" />
      <path d="m9 17-2 3m8-3 2 3M10 11h.01M14 11h.01" />
    </svg>
  );
}

function ShrimpIcon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 14c2 2 5 3 8 2 3-1 5-4 5-7-2-2-5-3-8-2-3 0-5 2-6 4" />
      <path d="m9 9 2 5m2-6 1 6m2-5 1 4" />
      <path d="m7 11-3-4 1 5-4 2 6 2m12-7 3-3m-3 4 4-1" />
      <path d="m10 16-2 4m5-3-1 4m4-5 1 3" />
      <circle cx="18" cy="9" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SururuIcon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 17c0-6 3-11 8-11s8 5 8 11c-4 3-12 3-16 0Z" />
      <path d="M8 8c-1 3-1 6 0 10m4-12v13m4-11c1 3 1 6 0 9" />
    </svg>
  );
}

function BaitIcon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v10a5 5 0 1 1-5-5" />
      <path d="M10 5c1-2 3-2 4 0s-1 4-2 5c-1-1-3-3-2-5Z" />
    </svg>
  );
}

const iconsByName: Record<CategoryIconName, IconComponent> = {
  ostra: OysterIcon,
  caranguejo: CrabIcon,
  peixe: Fish,
  camarao: ShrimpIcon,
  marisco: Shell,
  sururu: SururuIcon,
  outros: Package,
  combustivel: Fuel,
  transporte: Truck,
  gelo: Snowflake,
  equipamentos: Anchor,
  manutencao: Wrench,
  iscas: BaitIcon,
  alimentacao: UtensilsCrossed,
  moradia: Home,
  saude: HeartPulse,
  educacao: GraduationCap,
  lazer: Smile,
  generico: CircleHelp,
};

interface CategoryIconProps {
  category: string;
  kind: CategoryKind;
  size?: "sm" | "md";
}

const kindStyles: Record<CategoryKind, string> = {
  venda: "bg-mare-salesLight text-mare-primary",
  pesca: "bg-mare-fishingLight text-mare-institutional",
  casa: "bg-mare-homeLight text-mare-institutional",
};

export default function CategoryIcon({
  category,
  kind,
  size = "md",
}: CategoryIconProps) {
  const Icon = iconsByName[getCategoryIconName(category)];
  const iconSize = size === "sm" ? 18 : 20;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${kindStyles[kind]} ${size === "sm" ? "h-9 w-9" : "h-11 w-11"}`}
    >
      <Icon
        size={iconSize}
        strokeWidth={2}
        aria-hidden="true"
      />
    </span>
  );
}
