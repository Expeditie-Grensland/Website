const registerServiceWorker = async () => {
  try {
    await navigator.serviceWorker?.register("/worker.js");
  } catch (error) {
    console.error("Service worker registration failed:", error);
  }
};

registerServiceWorker();
