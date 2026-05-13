interface ActivityIndicatorProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "emerald" | "slate";
  label?: string;
}

export const ActivityIndicator = ({
  size = "md",
  color = "white",
  label,
}: ActivityIndicatorProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const colorClasses = {
    white: "text-white",
    emerald: "text-emerald-600",
    slate: "text-slate-700",
  };

  return (
    <span className="flex items-center justify-center gap-2">
      <svg
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
        />
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
};
