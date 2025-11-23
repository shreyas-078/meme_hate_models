import { useEffect } from "react";

export const useKeyboard = (key, callback, deps = []) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === key || event.code === key) {
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [key, callback, ...deps]);
};

export const useKeyboardShortcut = (keys, callback, deps = []) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { ctrlKey, shiftKey, altKey, metaKey, key } = event;

      const modifiersMatch =
        (keys.ctrl === undefined || keys.ctrl === (ctrlKey || metaKey)) &&
        (keys.shift === undefined || keys.shift === shiftKey) &&
        (keys.alt === undefined || keys.alt === altKey);

      if (modifiersMatch && key.toLowerCase() === keys.key.toLowerCase()) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [keys, callback, ...deps]);
};
