export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.65,
    targetSizeKB = 150,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Resize while keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      let currentQuality = quality;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              URL.revokeObjectURL(objectUrl);
              canvas.width = 0;
              canvas.height = 0;
              reject(new Error('Image compression failed'));
              return;
            }

            const sizeKB = blob.size / 1024;

            if (sizeKB > targetSizeKB && currentQuality > 0.4) {
              currentQuality -= 0.05;
              tryCompress();
            } else {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.\w+$/, '.jpg'),
                { type: 'image/jpeg' }
              );

              // cleanup
              URL.revokeObjectURL(objectUrl);
              canvas.width = 0;
              canvas.height = 0;

              resolve(compressedFile);
            }
          },
          'image/jpeg',
          currentQuality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}
