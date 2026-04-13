import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function Tabs(props) {
  return <TabsPrimitive.Root {...props} />;
}

function TabsList({ className, ...props }) {
  return <TabsPrimitive.List className={cn("inline-flex items-center", className)} {...props} />;
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger };