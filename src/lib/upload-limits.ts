/**
 * Limiti dei file caricati. Lo spazio gratuito di Supabase è 1 GB per tutto
 * l'anno: le foto vengono ridotte nel browser prima di partire e i PDF hanno
 * un tetto, così sette numeri restano ben sotto il limite.
 */
export const IMAGE_MAX_SIDE = 1600; // pixel sul lato lungo: bastano per lo schermo intero
export const IMAGE_QUALITY = 0.8; // WebP, qualità 80%
export const IMAGE_MAX_BYTES = 3 * 1024 * 1024; // dopo la riduzione (le GIF non si riducono)
export const IMAGE_INPUT_MAX_BYTES = 30 * 1024 * 1024; // foto originale accettata prima della riduzione
export const PDF_MAX_BYTES = 20 * 1024 * 1024;

export const mb = (bytes: number) => `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
