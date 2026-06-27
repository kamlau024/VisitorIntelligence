import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-ink hover:bg-accent-hover shadow-[0_1px_2px_rgba(33,28,24,0.12)]",
        secondary:
          "bg-surface text-ink border border-line-strong hover:bg-surface-2 edge",
        outline:
          "border border-line-strong bg-transparent text-ink hover:bg-surface-2",
        ghost: "text-ink hover:bg-surface-2",
        subtle: "bg-accent-soft text-accent-press hover:bg-accent-soft/70",
        link: "text-accent underline-offset-4 hover:underline p-0 h-auto",
        danger: "bg-negative text-white hover:bg-negative/90",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-md",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-[15px] rounded-xl",
        icon: "size-10",
        "icon-sm": "size-8 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
