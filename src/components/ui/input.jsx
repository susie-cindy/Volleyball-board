import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300",
        className
      )}
      {...props}
    />
  );
}

export { Input };