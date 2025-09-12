import React, { useEffect } from "react";

const colors = {
  success: "bg-green-600 text-white", // #16A34A
  warning: "bg-amber-500 text-white", // #F59E0B
  error: "bg-red-600 text-white", // fallback red for errors
};

const Notification = ({
  type = "success",
  message,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-3 rounded shadow-lg ${colors[type]}`}
      role="alert"
    >
      {message}
      <button onClick={onClose} className="ml-4 font-bold hover:opacity-80">
        ×
      </button>
    </div>
  );
};

export default Notification;
