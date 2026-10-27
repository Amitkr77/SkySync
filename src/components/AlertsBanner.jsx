import { useContext, useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import dataContext from "./Context/dataContext/dataContext";

const AlertsBanner = () => {
  const { sharedData } = useContext(dataContext);
  const [dismissed, setDismissed] = useState(false);

  // Alerts for a newly searched place should show again.
  useEffect(() => setDismissed(false), [sharedData]);

  const alerts = sharedData?.alerts ?? [];
  if (dismissed || alerts.length === 0) return null;

  return (
    <div role="status" className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" strokeWidth={2} />
        <div className="min-w-0 flex-1 space-y-2">
          {alerts.map((alert, i) => (
            <details key={alert.id ?? i} className="group">
              <summary className="cursor-pointer list-none text-sm font-medium">
                {alert.event || alert.headline}
                <span className="ml-2 text-xs font-normal text-muted group-open:hidden">Details</span>
              </summary>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{alert.description}</p>
            </details>
          ))}
        </div>
        <button
          type="button"
          aria-label="Dismiss alerts"
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 text-muted hover:bg-amber-500/10 hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AlertsBanner;
