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

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout session not created");
      }
    } catch (error) {
      setCheckoutError(error.message || "Something went wrong");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between border-b border-stone-200 pb-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
            Begin Again
          </p>

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
                className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm font-medium"
              >
                Preview
              </a>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {isCheckingOut ? "Loading..." : "Buy now for $9"}
              </button>
            </div>

            {checkoutError && (
              <p className="mt-3 text-sm text-red-600">{checkoutError}</p>
            )}
          </div>

          <div id="product" className="rounded-[24px] border bg-stone-100 p-4">
            <div className="rounded-[20px] bg-white p-5">
              <p className="text-sm uppercase text-stone-500">
                ADHD Reset Planner
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                A gentle reset for your week
              </h2>

              <div className="mt-6 h-40 rounded border border-dashed bg-stone-50 flex items-center justify-center text-stone-400">
                Preview only
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f}
              className="rounded-[20px] border bg-white p-5 text-stone-700"
            >
              {f}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Confirming payment...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage("Missing session.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`${API_URL}/verify-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json();

        if (data.paid) {
          setStatus("verified");
          setMessage("You're in. Begin Again starts now.");
        } else {
          setStatus("error");
          setMessage("Payment not confirmed yet.");
        }
      } catch {
        setStatus("error");
        setMessage("Verification failed.");
      }
    }

    verify();
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white p-8 rounded-xl text-center">
        <h1 className="text-xl font-semibold">{message}</h1>

        {status === "verified" ? (
          <a
            href="/downloads/full-planner.pdf"
            download
            className="mt-4 inline-block bg-sky-600 text-white px-4 py-2 rounded"
          >
            Download
          </a>
        ) : (
          <Link to="/" className="mt-4 inline-block text-sky-600">
            Back home
          </Link>
        )}
      </div>
    </main>
  );
}

function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white p-8 rounded-xl text-center">
        <h1>No worries — try again anytime.</h1>
        <Link to="/" className="mt-4 inline-block text-sky-600">
          Back home
        </Link>
      </div>
    </main>
  );
}

export default App;
