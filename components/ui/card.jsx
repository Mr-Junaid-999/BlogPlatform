import React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm",
        className
      )}
      {...rest}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;

  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...rest}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;

  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...rest}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;

  return <div ref={ref} className={cn("p-6 pt-0", className)} {...rest} />;
});
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
