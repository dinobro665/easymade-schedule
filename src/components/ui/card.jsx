export function Card({ children, className = "", ...props }) {
    return <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`} {...props}>{children}</div>;
  }
  
  export function CardContent({ children, ...props }) {
    return <div {...props}>{children}</div>;
  }
  