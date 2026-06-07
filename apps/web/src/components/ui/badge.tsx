import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800",
        confere: "bg-civilium-accent/20 text-civilium-accent-dark",
        naoConfere: "bg-red-100 text-red-800",
        erro: "bg-amber-100 text-amber-900",
        pendente: "bg-slate-100 text-slate-700",
        andamento: "bg-civilium-primary/15 text-civilium-primary-dark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
