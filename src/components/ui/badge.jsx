import { cn } from "@/lib/utils";

function Badge({ className, variant = "default", ...props }) {
  const styles = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-900",
    outline: "border border-slate-300 text-slate-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[variant] || styles.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };