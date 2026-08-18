/** Resize and compress an image file to a JPEG data URL for previews or lightweight storage */
export const fileToDataUrl = (file, maxWidth = 280) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Please select a valid image file (PNG, JPG, or WebP).'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Image must be smaller than 5 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => reject(new Error('Could not read image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });

/** Safely resolve stored image URLs, fallback images, or uploaded Cloudinary paths */
export const resolveStoredImage = (value, fallback = '/Images_Folder/Logo_transparent.png') => {
  if (!value || value === 'default-logo.png') return fallback;
  // If it's a full URL (like Cloudinary) or a relative path, return it directly
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }
  return value;
};