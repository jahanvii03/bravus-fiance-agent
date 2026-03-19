import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './NFAPieChart.css';

interface NFAPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title: string;
  height?: number;
  labelField?: string;
  valueField?: string;
}

const COLORS = [
  '#3b82f6', // chart-primary
  '#10b981', // chart-secondary
  '#f59e0b', // chart-tertiary
  '#8b5cf6', // chart-quaternary
  '#6366f1', // primary
  '#feef16ff', // accent
];

export function NFAPieChart({
  data,
  title,
  height = 300,
  labelField = "Category",
  valueField = "Value"
}: NFAPieChartProps) {

  // Determine if we should format as currency or count
  const isCurrencyField = valueField.toLowerCase().includes('value') ||
    valueField.toLowerCase().includes('amount') ||
    valueField.toLowerCase().includes('contract');

  const isCountField = valueField.toLowerCase().includes('count') ||
    valueField.toLowerCase().includes('invoice count');

  const formatValue = (value: number) => {
    if (isCurrencyField) {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else if (isCountField) {
      return value.toString();
    } else {
      return value.toLocaleString();
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip-container">
          <p className="tooltip-label">{`${labelField}: ${payload[0].name}`}</p>
          <p className="tooltip-value">
            {valueField}: <span className="tooltip-bold">{formatValue(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="legend-container">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: entry.color }}
            />
            <span className="legend-text">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}