const donationController = require("./donation.controller");
const { makeDonationSchema } = require("./donation.schema");

async function donationRoutes(fastify) {
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    privateRoutes.post(
      "/stories/:storyId/donate",
      { schema: makeDonationSchema },
      donationController.makeDonation
    );
  });
}

module.exports = donationRoutes;
