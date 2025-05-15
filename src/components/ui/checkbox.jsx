import * as React from "react";

const Checkbox = React.forwardRef(({ checked, onCheckedChange, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";
export { Checkbox };
