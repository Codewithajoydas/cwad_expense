import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
}: {
  children: ReactNode;
}) {
  const style: CSSProperties = {
    padding: 24,
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
  };

  return <div style={style}>{children}</div>;
}