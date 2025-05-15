export function Table({ children }) {
    return <table className="w-full border">{children}</table>;
  }
  
  export function TableHeader({ children }) {
    return <thead className="bg-gray-100">{children}</thead>;
  }
  
  export function TableRow({ children }) {
    return <tr>{children}</tr>;
  }
  
  export function TableHead({ children }) {
    return <th className="border px-2 py-1 text-left">{children}</th>;
  }
  
  export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
  }
  
  export function TableCell({ children }) {
    return <td className="border px-2 py-1">{children}</td>;
  }
  