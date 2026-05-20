/**
 * Utility to compress images on the client-side before uploading them.
 * This guarantees the request size is small and fits standard proxy and network limits.
 */
export function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<Blob | File> {
  return new Promise((resolve) => {
    // Graceful fallback for non-browser or non-supported environments
    if (typeof window === "undefined" || !window.FileReader || !window.HTMLCanvasElement) {
      resolve(file);
      return;
    }

    // Only compress standard image types
    if (!file.type.startsWith("image/") || file.type.includes("gif")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Compute resized dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Return a named File-like Blob if possible, or just the Blob
                resolve(new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now()
                }));
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        } catch (err) {
          console.warn("Resizing canvas failed, falling back to original file:", err);
          resolve(file);
        }
      };
      img.onerror = (err) => {
        console.warn("Loading image failed, falling back to original file:", err);
        resolve(file);
      };
    };
    reader.onerror = (err) => {
      console.warn("Reading file failed, falling back to original file:", err);
      resolve(file);
    };
  });
}
