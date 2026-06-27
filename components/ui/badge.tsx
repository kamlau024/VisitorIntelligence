import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0 transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent-soft text-accent-press",
        outline: "border-line-strong text-ink-muted bg-transparent",
        solid: "border-transparent bg-ink text-paper",
        sage: "border-transparent bg-positive-soft text-positive",
        ochre: "border-transparent bg-conf-med-soft text-conf-med",
        clay: "border-transparent bg-conf-low-soft text-conf-low",
        teal: "border-transparent bg-[#e2ecef] text-teal",
        plum: "border-transparent bg-[#f0e6ea] text-plum",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
