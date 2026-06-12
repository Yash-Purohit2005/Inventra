import { AlertTriangle } from 'lucide-react';

function ErrorMessage({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <AlertTriangle size={18} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export default ErrorMessage;