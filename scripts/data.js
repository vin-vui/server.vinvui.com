/**
 * data.js — Données du configurateur.
 *
 * Tous les prix sont en euros, TTC, sur une base annuelle.
 * Pour ajouter/modifier une offre, c'est ici et seulement ici.
 */

export const CONTACT_EMAIL = "vincent@vinvui.com";

export const servers = [
  {
    id: "starter",
    name: "Starter",
    vcpu: "1",
    ram: "512 Mo",
    ssd: "10 Go",
    tr: "500 Go",
    price: 120,
    desc: "Petits sites vitrines ou blogs à faible trafic.",
  },
  {
    id: "essentiel",
    name: "Essentiel",
    vcpu: "1",
    ram: "1 Go",
    ssd: "25 Go",
    tr: "1 000 Go",
    price: 180,
    desc: "Sites personnels ou petites entreprises.",
  },
  {
    id: "standard",
    name: "Standard",
    vcpu: "1",
    ram: "2 Go",
    ssd: "50 Go",
    tr: "2 000 Go",
    price: 300,
    featured: true,
    desc: "Sites d'entreprise ou e-commerce à trafic modéré.",
  },
  {
    id: "standardp",
    name: "Standard Plus",
    vcpu: "2",
    ram: "2 Go",
    ssd: "60 Go",
    tr: "3 000 Go",
    price: 420,
    desc: "Sites nécessitant plus de puissance de calcul.",
  },
  {
    id: "pro",
    name: "Professionnel",
    vcpu: "2",
    ram: "4 Go",
    ssd: "80 Go",
    tr: "4 000 Go",
    price: 540,
    desc: "Sites à fort trafic ou applications web complexes.",
  },
  {
    id: "premium",
    name: "Premium",
    vcpu: "4",
    ram: "8 Go",
    ssd: "160 Go",
    tr: "5 000 Go",
    price: 1020,
    desc: "Plateformes exigeant des performances élevées.",
  },
];

export const maintenance = [
  {
    id: "std",
    medal: "🥉",
    name: "Standard",
    price: 300,
    featured: false,
    feats: [
      "Correctifs de sécurité du serveur",
      "Maj système indispensables (serveur)",
      "Surveillance mensuelle",
      "Réponse aux incidents sous 72 h",
    ],
    ideal: "Sites à faible trafic, maintenance de base sûre et fiable.",
  },
  {
    id: "prof",
    medal: "🥈",
    name: "Professionnelle",
    price: 540,
    featured: true,
    feats: [
      "Mises à jour régulières (sécurité + perf.)",
      "Maj système + optimisation config",
      "Surveillance hebdomadaire",
      "Réponse aux incidents sous 24 h",
    ],
    ideal: "Entreprises voulant performance et disponibilité.",
  },
  {
    id: "exc",
    medal: "🏅",
    name: "Excellence",
    price: 960,
    featured: false,
    feats: [
      "Mises à jour immédiates et prioritaires",
      "Optimisation avancée + gestion ressources",
      "Surveillance 24/7 avec alertes",
      "Réponse aux incidents sous 12 h",
    ],
    ideal: "Sites critiques nécessitant un support très réactif.",
  },
];

export const optionGroups = [
  {
    id: "emailing",
    label: "Service d'emailing",
    defaultId: "email-none",
    choices: [
      {
        id: "email-none",
        name: "Sans emailing",
        price: 0,
        isNone: true,
        desc: "Aucun service d'emailing inclus dans cette offre.",
        tags: [],
      },
      {
        id: "email-brevo-free",
        name: "Brevo Free",
        price: 65,
        desc: "Configuration complète (compte, SPF, DKIM, DMARC). Jusqu'à 300 emails/jour, logo Brevo visible.",
        tags: ["Jusqu'à 9 000 emails/mois", "Conforme RGPD", "Logo Brevo"],
      },
      {
        id: "email-brevo-starter",
        name: "Brevo Starter",
        price: 225,
        pricePrefix: "à partir de",
        desc: "Configuration complète + abonnement Brevo Starter inclus. Sans logo Brevo, envoi illimité selon volume.",
        tags: ["5 000 à 100 000 emails/mois", "Conforme RGPD", "Sans logo Brevo"],
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytique",
    defaultId: "analytics-none",
    choices: [
      {
        id: "analytics-none",
        name: "Sans analytique",
        price: 0,
        isNone: true,
        desc: "Aucun outil d'analyse de trafic inclus dans cette offre.",
        tags: [],
      },
      {
        id: "analytics-plausible",
        name: "Service d'analytique",
        price: 70,
        desc: "Installation de Plausible Analytics, intégré à votre tableau de bord admin, avec conseils d'optimisation.",
        tags: ["Conforme RGPD", "Sans cookies", "Hébergé en Europe"],
      },
    ],
  },
  {
    id: "domain",
    label: "Nom de domaine",
    defaultId: "domain-none",
    choices: [
      {
        id: "domain-none",
        name: "Sans nom de domaine",
        price: 0,
        isNone: true,
        desc: "Vous gérez votre nom de domaine de votre côté.",
        tags: [],
      },
      {
        id: "domain-managed",
        name: "Nom de domaine",
        price: 20,
        desc: "Gestion et configuration complète de votre nom de domaine et des serveurs DNS.",
        tags: [".com ou .fr", "Configuration DNS", "Gestion incluse"],
      },
    ],
  },
];
