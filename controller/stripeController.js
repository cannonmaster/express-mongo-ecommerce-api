const stripe = require("stripe")("process.env.STRIPE_KEY");

const stripeController = async (req, res) => {
  const { shipping_fee, total_amount, purchase } = req.body;

  const paymentIntent = await stripe.paymentIntent.create({
    amount: shipping_fee + total_amount,
    currency: "usd",
  });

  res.json({ clientSecret: paymentIntent.client_secret });
};

module.exports = stripeController;
