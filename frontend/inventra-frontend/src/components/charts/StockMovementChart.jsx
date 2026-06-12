import {
  BarChart, Bar, Line, ComposedChart,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

function StockMovementChart({ data }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Stock Movements (Last 7 Days)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" fontSize={12} stroke="#64748b" />
          <YAxis fontSize={12} stroke="#64748b" />
          <Tooltip />
          <Legend />
          <Bar dataKey="unitsIn" fill="#16a34a" name="Stock In" radius={[4, 4, 0, 0]} />
          <Bar dataKey="unitsOut" fill="#dc2626" name="Stock Out" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="netMovement"
            stroke="#1e40af"
            strokeWidth={2}
            name="Net Movement"
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockMovementChart;