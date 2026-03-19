import { Card } from "@/components/ui/card";
import './NFADataTable.css';
import type { NFARecord } from "@/data/mockData";

interface NFADataTableProps {
  data: NFARecord[];
  title: string;
  columns: {
    key: keyof NFARecord;
    label: string;
    format?: (value: any) => string;
  }[];
}

export function NFADataTable({ data, title, columns }: NFADataTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadge = (value: number) => {
    if (value > 1000000) {
      return <span className="badge badge-high">High Value</span>;
    } else if (value > 100000) {
      return <span className="badge badge-medium">Medium Value</span>;
    } else {
      return <span className="badge badge-low">Low Value</span>;
    }
  };

  return (
    <div className="card">
      <div className="table-header">
        <h3 className="table-title">{title}</h3>
        <span className="badge badge-outline">{data.length} records</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="table-head">
                  {column.label}
                </th>
              ))}
              {/* <th className="table-head">Status</th> */}
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr key={record.ID} className="table-row">
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.format 
                      ? column.format(record[column.key])
                      : String(record[column.key] || '-')
                    }
                  </td>
                ))}
                {/* <td className="table-cell">
                  {getStatusBadge(record.bravusContractValue)}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 10 && (
        <div className="table-footer">
          <p className="footer-text">Showing {data.length} of {data.length} records</p>
        </div>
      )}
    </div>
  );
}
