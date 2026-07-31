/**
 * Identifiant de la version en cours d'exécution.
 *
 * La valeur est figée à la compilation : le code servi par un déploiement
 * connaît donc « son » identifiant, et l'API `/api/version` renvoie celui du
 * déploiement qui répond maintenant. Si les deux diffèrent, c'est que la page
 * ouverte date d'avant une mise en ligne — le cas typique d'une application
 * gardée sur l'écran d'accueil, qui peut rester des jours sans se recharger.
 */
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "dev";

/** Version courte, lisible dans le pied de page. */
export function shortBuildId(): string {
  return BUILD_ID.slice(0, 8);
}
