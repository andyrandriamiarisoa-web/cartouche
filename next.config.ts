import type { NextConfig } from "next";

/**
 * Identifiant de version figé à la compilation. Sur Vercel on prend le commit
 * déployé ; en local une valeur stable évite de faire croire à une mise à jour
 * à chaque redémarrage.
 */
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ??
  process.env.VERCEL_DEPLOYMENT_ID ??
  "dev";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default nextConfig;
