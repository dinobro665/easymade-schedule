export function Button({ children, ...props }) {
    return <button className="bg-gray-800 text-white rounded px-4 py-2" {...props}>{children}</button>;
  }
  