import { MonthlyReturns } from "@/types/track-record";

interface MonthlyReturnsTableProps {
  data: MonthlyReturns;
}

function formatReturn(value: number | null): string {
  if (value === null || value === undefined) {
    return "—";
  }
  const percent = value * 100;
  const formatted = percent.toFixed(2);
  if (value > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}

function formatReturnMobile(value: number | null): string {
  if (value === null || value === undefined) {
    return "—";
  }
  const percent = value * 100;
  const rounded = Math.round(percent);
  if (value > 0) {
    return `+${rounded}`;
  }
  return `${rounded}`;
}

function getValueClass(value: number | null): string {
  if (value === null || value === undefined || value === 0) {
    return "text-neutral";
  }
  if (value > 0) {
    return "text-positive";
  }
  return "text-negative";
}

export default function MonthlyReturnsTable({ data }: MonthlyReturnsTableProps) {
  const { columns, rows } = data;

  // Reverse rows so current year is first
  const reversedRows = [...rows].reverse();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Monthly Returns</h2>
      </div>
      <div className="overflow-hidden">
        <table className="returns-table">
          <thead>
            <tr>
              <th className="bg-gray-50">Year</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reversedRows.map((row) => (
              <tr key={row.Year}>
                <td className="bg-white">{row.Year}</td>
                {columns.map((col) => {
                  const value = row[col as keyof typeof row] as number | null;
                  return (
                    <td key={col} className={getValueClass(value)}>
                      <span className="hidden sm:inline">{formatReturn(value)}</span>
                      <span className="inline sm:hidden">{formatReturnMobile(value)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
