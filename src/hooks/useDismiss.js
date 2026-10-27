import { useEffect } from "react";

// Calls `onClose` on a click outside `ref` or on Escape, while `open` is true.
export default function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, open, onClose]);
}
