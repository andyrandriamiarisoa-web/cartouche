export const SITE_NAME = "Cartouche";
export const SITE_TAGLINE = "La carte postale sonore";
export const SITE_DESCRIPTION =
  "Enregistrez 30 secondes de vie — un rire, la mer, un bonne-nuit — et envoyez-les dans une jolie carte postale sonore. Un lien à partager, sans compte ni application.";

/** URL absolue du site (OG, sitemap). Renseignée automatiquement sur Vercel. */
export function siteUrl(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}
