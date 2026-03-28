export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.7,
    targetSizeKB = 150,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    reader.onerror = reject;

    img.onload = async () => {
      let width = img.width;
      let height = img.height;

      // Resize while keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      let currentQuality = quality;

      const tryCompress = () => {
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
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
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          currentQuality
        );
      };

      tryCompress();
    };

    img.onerror = reject;
  });
}
