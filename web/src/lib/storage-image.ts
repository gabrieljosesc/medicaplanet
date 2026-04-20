/**
 * Optional Supabase Storage image transformation URL.
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function withStorageImageTransform(
  publicObjectUrl: string,
  width: number,
  quality = 75
): string {
  if (!publicObjectUrl.includes("/storage/v1/object/public/")) return publicObjectUrl;
  const render = publicObjectUrl.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const sep = render.includes("?") ? "&" : "?";
  return `${render}${sep}width=${width}&quality=${quality}`;
}
