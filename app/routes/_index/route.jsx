import { redirect } from "react-router";
import { useActionData } from "react-router";
import { login } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
};

export const action = async ({ request }) => {
  return login(request);
};

export default function LoginPage() {
  const actionData = useActionData();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "20px",
    }}>
      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>

        {/* Logo/Icon */}
        <div style={{
          width: "80px", height: "80px",
          background: "linear-gradient(135deg, #4CAF50, #2196F3)",
          borderRadius: "20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: "36px",
        }}>
          📄
        </div>

        {/* Headline */}
        <h1 style={{
          color: "#ffffff",
          fontSize: "32px",
          fontWeight: "700",
          margin: "0 0 12px",
          lineHeight: "1.2",
        }}>
          ChargebackReady
        </h1>

        <p style={{
          color: "#94a3b8",
          fontSize: "16px",
          margin: "0 0 40px",
          lineHeight: "1.6",
        }}>
          Generate professional chargeback dispute evidence in 60 seconds.
          Keep 100% of every win.
        </p>

        {/* Login Form */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "32px",
          backdropFilter: "blur(10px)",
        }}>
          <form method="post">
            <label style={{
              display: "block",
              color: "#cbd5e1",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
              textAlign: "left",
            }}>
              Shop domain
            </label>
            <input
              type="text"
              name="shop"
              placeholder="your-store.myshopify.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "16px",
              }}
            />
            {actionData?.errors?.shop && (
              <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "12px" }}>
                {actionData.errors.shop}
              </p>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #4CAF50, #2196F3)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Log in to your store
            </button>
          </form>
        </div>

        {/* Features */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          marginTop: "32px",
        }}>
          {[
            { icon: "⚡", text: "60 second evidence packages" },
            { icon: "💰", text: "Keep 100% of every win" },
            { icon: "🔒", text: "Read-only store access" },
          ].map((f, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px 12px",
              color: "#94a3b8",
              fontSize: "12px",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>

        <p style={{ color: "#475569", fontSize: "12px", marginTop: "24px" }}>
          By Eleven45 Ventures · $19/month after 7-day free trial
        </p>
      </div>
    </div>
  );
}
