import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";

const API_URL = "https://begin-again-api.onrender.com";

const features = [
  "Reset your week in one calm page",
  "Plan focus blocks without overwhelm",
  "Keep momentum visible with a simple calendar",
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function LandingPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function handleCheckout() {
    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout is unavailable right now.");
      }
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
              Begin Again
            </p>
          </div>
          <a href="#product" className="text-sm font-medium text-sky-600">
            See the planner
          </a>
        </header>

        <section className="grid gap-8 rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
              Digital product
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Small steps.
              <br />
              Real progress.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-stone-600">
              A calm, focused planner for the days when your brain needs a reset
              instead of pressure.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#product"
                className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm font-medium text-stone-900 transition hover:border-stone-400"
              >
                Preview
              </a>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="rounded-full bg-sky-600 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
              >
                {isCheckingOut ? "Preparing checkout…" : "Buy now for $9"}
              </button>
            </div>

            {checkoutError ? (
              <p className="mt-3 text-sm text-rose-600">{checkoutError}</p>
            ) : null}
          </div>

          <div
            id="product"
            className="relative overflow-hidden rounded-[24px] border border-stone-200 bg-stone-100 p-4"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_45%)]" />

            <div className="relative rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-stone-500">
                    ADHD Reset Planner
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                    A gentle reset for your week
                  </h2>
                </div>
                <div className="rounded-full bg-sky-600 px-3 py-1 text-sm font-medium text-white">
                  $9
                </div>
              </div>

              <div className="relative h-56 overflow-hidden rounded-[18px] border border-dashed border-stone-300 bg-stone-50 p-4">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.5))]" />

                <div className="relative flex h-full flex-col justify-between rounded-[14px] border border-stone-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-medium text-stone-500">
                      Preview only
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-stone-900">
                      Reset planner + calendar
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-stone-700 backdrop-blur">
                    Preview only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature}
              className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                Simple
              </p>
              <p className="mt-2 text-lg leading-7 text-stone-700">{feature}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Confirming your payment…");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage("We could not confirm your payment yet.");
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch(`${API_URL}/verify-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await response.json();

        if (data.paid) {
          setStatus("verified");
          setMessage("You're in. Begin Again starts now.");
        } else {
          setStatus("error");
          setMessage("Your payment is still being confirmed.");
        }
      } catch {
        setStatus("error");
        setMessage("We could not verify your session right now.");
      }
    }

    verifySession();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-900">
      <div className="w-full max-w-xl rounded-[32px] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
          Success
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {message}
        </h1>

        {status === "verified" ? (
          <a
            href="/downloads/full-planner.pdf"
            download
            className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white"
          >
            Download your planner
          </a>
        ) : (
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full border px-5 py-3 text-sm"
          >
            Return home
          </Link>
        )}
      </div>
    </main>
  );
}

function CancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-900">
      <div className="w-full max-w-xl rounded-[32px] border bg-white p-8 text-center">
        <h1 className="text-3xl font-semibold">
          No pressure. Try again anytime.
        </h1>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-white"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}

export default App;
