export async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = async () => {
      try {
        const maxWidth = 700;
        const maxHeight = 700;

        let { width, height } = img;

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

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.55;
        let compressedBlob = await new Promise((res) =>
          canvas.toBlob(res, 'image/jpeg', quality)
        );

        while (compressedBlob && compressedBlob.size > 110 * 1024 && quality > 0.3) {
          quality -= 0.05;
          compressedBlob = await new Promise((res) =>
            canvas.toBlob(res, 'image/jpeg', quality)
          );
        }

        if (!compressedBlob) {
          reject(new Error('Compression failed'));
          return;
        }

        // cleanup memory
        canvas.width = 0;
        canvas.height = 0;
        img.src = '';

        const compressedFile = new File(
          [compressedBlob],
          `${file.name.split('.')[0] || 'image'}.jpg`,
          {
            type: 'image/jpeg',
            lastModified: Date.now(),
          }
        );

        resolve(compressedFile);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = reject;
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}
