import express from "express";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Frontend URL (set this in Render)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Stripe init (test or live depending on env)
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

// CREATE CHECKOUT SESSION
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
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// VERIFY SESSION
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

// HEALTH CHECK (optional but useful for Render)
app.get("/", (req, res) => {
  res.json({ status: "Begin Again API running" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
