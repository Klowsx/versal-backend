const COIN_PACKS = [
  {
    id: "pack_100_coins",
    name: "Paquete Básico",
    description: "100 monedas para apoyar a tus autores favoritos.",
    coins: 100,
    stripePriceId: "price_1RpOvtR09FDM2B1YL43aCKKi",
  },
  {
    id: "pack_500_coins",
    name: "Paquete de Fan",
    description: "500 monedas para los lectores más dedicados.",
    coins: 500,
    stripePriceId: "price_1RpOi7R09FDM2B1Y6ifORS0i",
  },
  {
    id: "pack_1000_coins",
    name: "Paquete de Onii-chan",
    description: "1000 monedas y el agradecimiento eterno de los autores.",
    coins: 1000,
    stripePriceId: "price_1RpOtXR09FDM2B1YmqgNXXiC",
  },
];

const SUBSCRIPTION_PLANS = [
  {
    id: "premium_monthly",
    name: "Suscripción Premium",
    description: "Acceso sin anuncios y apoyo continuo a la plataforma.",
    stripePriceId: "price_1RpO06R09FDM2B1Y0h4JVXLa",
  },
];

module.exports = { COIN_PACKS, SUBSCRIPTION_PLANS };
