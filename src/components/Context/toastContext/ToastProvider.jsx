import { useCallback, useRef, useState } from "react";
import { X } from "lucide-react";
import ToastContext from "./ToastContext";

const DURATION_MS = 4000;

// Small, non-blocking notifications with an optional action (e.g. Undo).
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (message, { action, onAction } = {}) => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-2), { id, message, action, onAction }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[1300] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex animate-pop items-center gap-3 rounded-full border border-line bg-fg py-2 pl-4 pr-2 text-sm text-bg shadow-xl"
          >
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  dismiss(toast.id);
                }}
                className="rounded-full px-2 py-0.5 font-medium text-accent hover:bg-bg/10"
              >
                {toast.action}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
              className="rounded-full p-1 opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
