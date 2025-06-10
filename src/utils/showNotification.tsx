/**
 * Shows a temporary notification message
 */
export const showNotification = (
  message: string,
  type: "success" | "warning" | "error"
) => {
  if (typeof window !== "undefined") {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#10b981"
            : type === "warning"
              ? "#f59e0b"
              : "#ef4444"
        };
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 400px;
      `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  }
};
