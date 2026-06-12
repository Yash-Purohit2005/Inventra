function StockBadge({ currentStock, threshold }) {
  let label, classes;

  if (currentStock <= threshold * 0.5) {
    label = 'CRITICAL';
    classes = 'bg-red-100 text-red-700';
  } else if (currentStock <= threshold) {
    label = 'LOW';
    classes = 'bg-amber-100 text-amber-700';
  } else {
    label = 'OK';
    classes = 'bg-green-100 text-green-700';
  }

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${classes}`}>
      {label}
    </span>
  );
}

export default StockBadge;