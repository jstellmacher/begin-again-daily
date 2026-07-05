import express from "express";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const stripeEnabled = Boolean(
  process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.includes("placeholder"),
);
const stripe = stripeEnabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.json({ url: "/success?session_id=demo-session" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ADHD Reset Planner + Calendar",
              description: "A calm digital planner for resetting your week.",
            },
            unit_amount: 900,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin || "http://localhost:5173"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || "http://localhost:5173"}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Checkout failed" });
  }
});

app.post("/verify-session", async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.json({ paid: false });
    }

    if (!stripe || session_id === "demo-session") {
      return res.json({ paid: true });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({ paid: session.payment_status === "paid" });
  } catch (error) {
    console.error(error);
    res.json({ paid: false });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
