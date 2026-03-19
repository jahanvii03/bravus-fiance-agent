import { Card } from "@/components/ui/card";
import './KPICard.css';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "positive" | "negative" | "neutral" | "warning";
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, subtitle, trend = "neutral", icon, className }: KPICardProps) {
  const trendColorClass = {
    positive: 'trend-positive',
    negative: 'trend-negative',
    neutral: 'trend-neutral',
    warning: 'trend-warning',
  }[trend];

  return (
    <Card className={`card ${className || ''}`}>
      <div className="kpi-header">
        <div className="kpi-info">
          <p className="kpi-title">{title}</p>
          <div className="kpi-value-container">
            <span className={`kpi-value ${trendColorClass}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
          </div>
          {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
        </div>
        {icon && (
          <div className="kpi-icon-container">
            <div className="kpi-icon">{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
