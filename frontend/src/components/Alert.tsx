/**
 * Komponen Alert
 */

import { CheckCircle, XCircle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

function Alert({ type, message, onClose }: AlertProps) {
  const isSuccess = type === 'success';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 ${
        isSuccess
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <span className={`flex-1 text-sm ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          className={`p-1 rounded-full transition-colors ${
            isSuccess
              ? 'hover:bg-emerald-100 text-emerald-500'
              : 'hover:bg-red-100 text-red-500'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
