import React from "react";
import { cn } from "@/lib/utils";
import { colors, commonClasses } from "@/lib/design-system";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "light"
    | "outline";
  size?: "small" | "medium";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = "primary",
  size = "small",
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-red-9 text-white hover:bg-red-7";
      case "secondary":
        return "bg-gray-5 text-white hover:bg-gray-2";
      case "success":
        return "bg-green-500 text-white hover:bg-green-600";
      case "warning":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "info":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "light":
        return "bg-gray-1 text-black hover:bg-gray-2";
      case "outline":
        return "bg-transparent text-red-9 border border-red-3 hover:bg-red-0";
      default:
        return "bg-red-9 text-white hover:bg-red-7";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-3 py-1.5 text-sm";
      case "medium":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1.5 text-sm";
    }
  };

  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded font-medium",
        commonClasses.transition,
        commonClasses.font,
        getVariantClasses(),
        getSizeClasses(),
        {
          "opacity-50 cursor-not-allowed": disabled,
        },
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
