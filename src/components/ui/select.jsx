import { useState } from "react";

export function Select({ value, onValueChange, children }) {
  return (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} className="border rounded px-2 py-1">
      {children}
    </select>
  );
}

export function SelectTrigger({ children }) {
  return <>{children}</>;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }) {
  return <option disabled>{placeholder}</option>;
}
