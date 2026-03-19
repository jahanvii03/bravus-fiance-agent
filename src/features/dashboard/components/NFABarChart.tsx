import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './NFABarChart.css';

interface NFABarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function NFABarChart({
  data,
  title,
  height = 300,
  xAxisLabel = "Category",
  yAxisLabel = "Value"
}: NFABarChartProps) {
  // Determine if we should format as currency or count
  const isCurrencyField = yAxisLabel.toLowerCase().includes('value') ||
    yAxisLabel.toLowerCase().includes('amount') ||
    yAxisLabel.toLowerCase().includes('contract');

  console.log("==========================", data)

  const isCountField = yAxisLabel.toLowerCase().includes('count') ||
    yAxisLabel.toLowerCase().includes('invoice count');

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // console.log("-----------------------", payload);

      return (
        <div className="tooltip-container">
          <p className="tooltip-label">{`${xAxisLabel}: ${label}`}</p>
          <p className="tooltip-value">
            {yAxisLabel}: <span className="tooltip-bold">{formatValue(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="grid" />
            <XAxis
              dataKey="name"
              className="x-axis"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              className="y-axis"
              tickFormatter={formatValue}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              className="bar"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}