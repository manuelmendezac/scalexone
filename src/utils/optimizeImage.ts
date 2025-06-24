export async function optimizeImage(file: File): Promise<File> {
  if (typeof window === 'undefined') return file;
  try {
    const imageCompression = (await import('browser-image-compression')).default;
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1280,
      maxSizeMB: 1,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.7
    });
    return new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
  } catch (err) {
    return file;
  }
} 