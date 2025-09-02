import React from "react";
import { cn } from "@/lib/utils";
import { commonClasses, colors } from "@/lib/design-system";

interface ActionButtonProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  color:
    | "red"
    | "purple"
    | "green"
    | "blue"
    | "darkBlue"
    | "cyan"
    | "orange"
    | "pink"
    | "teal"
    | "emerald";
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  icon,
  onClick,
  disabled = false,
  className,
  color,
}) => {
  const colorClasses = {
    red: "bg-red-600 hover:bg-red-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    green: "bg-green-600 hover:bg-green-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    darkBlue: "bg-blue-800 hover:bg-blue-900",
    cyan: "bg-cyan-500 hover:bg-cyan-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    teal: "bg-teal-500 hover:bg-teal-600",
    emerald: "bg-emerald-500 hover:bg-emerald-600",
  };

  const finalColorClass = colorClasses[color];

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-3 px-6 py-4 rounded-lg text-white font-medium transition-colors duration-200",
        "text-base leading-tight min-h-[56px]",
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-400"
          : finalColorClass,
        commonClasses.font,
        className,
      )}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <span className="text-left">{children}</span>
    </button>
  );
};
