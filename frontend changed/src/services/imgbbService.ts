const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

/**
 * Uploads a single base64 data URL (e.g. from canvas.toDataURL() or FileReader)
 * to imgbb and returns the publicly hosted image URL.
 */
export async function uploadToImgbb(dataUrl: string): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error('Missing VITE_IMGBB_API_KEY in your .env file');
  }

  // dataUrl looks like "data:image/jpeg;base64,/9j/4AAQ..." — imgbb wants just the base64 part
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

  const form = new FormData();
  form.append('image', base64);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: form,
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json?.error?.message || 'imgbb upload failed');
  }

  return json.data.url as string;
}

/**
 * Uploads multiple captured photos (keyed by angle, e.g. { face, side, hornHump })
 * and returns them as a flat array of URLs, skipping any that are missing.
 */
export async function uploadCapturedPhotos(photos: {
  face?: string;
  side?: string;
  hornHump?: string;
}): Promise<string[]> {
  const entries = Object.values(photos).filter(Boolean) as string[];
  const uploads = await Promise.all(entries.map(uploadToImgbb));
  return uploads;
}
