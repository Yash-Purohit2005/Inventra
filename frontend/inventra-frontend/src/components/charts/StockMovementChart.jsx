import {
  BarChart, Bar, Line, ComposedChart,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

const formatValue = (val) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function StockMovementChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Stock Movements (Last 7 Days)
        </h3>
        <div className="flex items-center justify-center h-[250px] text-slate-400 text-sm">
          No stock movements in the last 7 days.
        </div>
      </div>
    );
  }

  // Calculate max value for domain padding
  const maxVal = Math.max(
    ...data.map(d => Math.max(d.unitsIn || 0, d.unitsOut || 0))
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Stock Movements (Last 7 Days)
        </h3>
        {/* Summary row */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-green-600 inline-block" />
            In: {formatValue(data.reduce((s, d) => s + (d.unitsIn || 0), 0))}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-600 inline-block" />
            Out: {formatValue(data.reduce((s, d) => s + (d.unitsOut || 0), 0))}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            fontSize={11}
            stroke="#64748b"
            tickFormatter={formatDate}
          />
          <YAxis
            fontSize={11}
            stroke="#64748b"
            tickFormatter={formatValue}
            domain={[0, maxVal * 1.1]}
            width={55}
          />
          <Tooltip
            formatter={(value, name) => [value.toLocaleString(), name]}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: '11px', color: '#64748b' }}>{value}</span>
            )}
          />
          <Bar
            dataKey="unitsIn"
            fill="#16a34a"
            name="Stock In"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="unitsOut"
            fill="#dc2626"
            name="Stock Out"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="netMovement"
            stroke="#1e40af"
            strokeWidth={2}
            name="Net Movement"
            dot={{ r: 3 }}
            yAxisId={0}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Data Table Below Chart for Exact Values */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-600">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider">
                <th className="text-left pb-1">Date</th>
                <th className="text-right pb-1 text-green-600">In</th>
                <th className="text-right pb-1 text-red-600">Out</th>
                <th className="text-right pb-1 text-blue-800">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d) => (
                <tr key={d.date}>
                  <td className="py-1 font-mono">{formatDate(d.date)}</td>
                  <td className="py-1 text-right font-mono text-green-600">
                    +{d.unitsIn?.toLocaleString()}
                  </td>
                  <td className="py-1 text-right font-mono text-red-600">
                    -{d.unitsOut?.toLocaleString()}
                  </td>
                  <td className={`py-1 text-right font-mono font-semibold ${
                    d.netMovement >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {d.netMovement >= 0 ? '+' : ''}{d.netMovement?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockMovementChart;