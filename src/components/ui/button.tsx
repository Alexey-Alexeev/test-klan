import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // App primary (unchanged theme primary)
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Extra
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Design system colors
        dsPrimary: "bg-[#141414] text-white hover:bg-[#141414]/90",
        accent: "bg-[#00AAFF] text-white hover:bg-[#00AAFF]/90",
        pay: "bg-[#965EEB] text-white hover:bg-[#965EEB]/90",
        success: "bg-[#02D15C] text-white hover:bg-[#02D15C]/90",
        danger: "bg-[#FF4053] text-white hover:bg-[#FF4053]/90",
        // Secondary previews (design system)
        secondaryDefault: "bg-[#F2F1F0] text-[#000000] hover:bg-[#F2F1F0]/90",
        secondaryAccent: "bg-[#CFEDFF] text-[#008AED] hover:bg-[#CFEDFF]/90",
        secondaryPay: "bg-[#E9DDFD] text-[#8C4FE8] hover:bg-[#E9DDFD]/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
