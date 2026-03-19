import React from "react";
import "./Badge.css";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const Badge: React.FC<BadgeProps> = ({ variant = "default", className = "", ...props }) => {
  return (
    <div className={`badge badge-${variant} ${className}`} {...props} />
  );
};

export { Badge };
