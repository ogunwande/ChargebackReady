import { useRef, useState, useCallback, useEffect } from "react";
import { useFetcher, useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { hasActiveSubscription } from "../utils/subscription.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const subscribed = await hasActiveSubscription(session.shop);
  return { subscribed };
};

export const action = async ({ request }) => {
  const { admin, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("_action");

  // Handle billing
  if (actionType === "start_billing") {
    const url = new URL(request.url);
    const returnUrl = `${url.protocol}//${url.host}/app`;
    try {
      await billing.require({
        plans: ["ChargebackReady Pro"],
        isTest: true,
        onFailure: async () => billing.request({
          plan: "ChargebackReady Pro",
          isTest: true,
          returnUrl,
        }),
      });
      return Response.json({ subscribed: true });
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error("[Billing Error]", error.message);
      return Response.json({ error: "billing_failed", message: error.message }, { status: 500 });
    }
  }

  // Handle order lookup
  const raw = (formData.get("orderId") || "").toString().replace(/^#/, "").trim();

  if (!raw || !/^\d{1,20}$/.test(raw)) {
    return Response.json({ error: "invalid_input", message: "Invalid order ID" });
  }

  const res = await admin.graphql(`#graphql
    query GetOrderPreview($query: String!) {
      orders(first: 1, query: $query) {
        edges {
          node {
            id
            name
            createdAt
            displayFulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            customer { firstName lastName }
            risk { assessments { riskLevel } }
          }
        }
      }
    }
  `, { variables: { query: `name:#${raw}` } });

  const data = await res.json();
  const edges = data?.data?.orders?.edges || [];

  if (edges.length === 0) {
    return Response.json({ error: "not_found", message: "Order not found" });
  }

  const order = edges[0].node;
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date(order.createdAt);
  const { amount, currencyCode } = order.totalPriceSet?.shopMoney || {};
  const symbols = { USD:"$", GBP:"£", EUR:"€", CAD:"C$", AUD:"A$" };
  const assessments = order.risk?.assessments || [];
  const weight = { HIGH:3, MEDIUM:2, LOW:1, NONE:0 };
  let highest = "NONE";
  for (const a of assessments) if ((weight[a.riskLevel]||0) > (weight[highest]||0)) highest = a.riskLevel;

  return Response.json({
    numericId: order.id.replace("gid://shopify/Order/", ""),
    orderNumber: order.name,
    customerName: order.customer ? `${order.customer.firstName||""} ${order.customer.lastName||""}`.trim()||"Guest" : "Guest",
    orderDate: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
    amount: amount ? `${symbols[currencyCode]||"$"}${parseFloat(amount).toFixed(2)} ${currencyCode}` : "Not available",
    riskLevel: highest==="NONE" ? "Not available" : highest.charAt(0)+highest.slice(1).toLowerCase(),
    fulfillmentStatus: order.displayFulfillmentStatus || "Unknown",
  });
};

function RiskBadge({ level }) {
  const tone =
    level === "High" ? "critical" : level === "Medium" ? "warning" : "success";
  return <s-badge tone={tone}>{level}</s-badge>;
}

export default function Index() {
  const { subscribed } = useLoaderData();
  const fetcher = useFetcher();
  const submit = useSubmit();
  const inputRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const retried = useRef(false);

  useEffect(() => {
    if (
      fetcher.data?.error === "auth_required" &&
      !retried.current &&
      inputRef.current?.value
    ) {
      retried.current = true;
      const val = inputRef.current.value.replace(/^#/, "").trim();
      fetcher.submit({ orderId: val, _action: "order_lookup" }, { method: "post", action: "/app?index" });
    }
    if (fetcher.data && fetcher.data.error !== "auth_required") {
      retried.current = false;
    }
  }, [fetcher.data]);

  const isLoading = fetcher.state === "loading" || fetcher.state === "submitting";
  const result = fetcher.data && !fetcher.data.error ? fetcher.data : null;
  const hasError = fetcher.data?.error != null;

  const handleSearch = useCallback(() => {
    const val = inputRef.current?.value || "";
    const raw = val.replace(/^#/, "").trim();
    if (!raw) return;
    fetcher.submit(
      { orderId: raw, _action: "order_lookup" },
      { method: "post", action: "/app?index" },
    );
  }, [fetcher]);

  async function handleDownload() {
    if (!result) return;
    setDownloading(true);
    try {
      const response = await fetch(`/app/orders/${result.numericId}/pdf`);
      if (!response.ok) {
        alert("Failed to generate PDF. Please try again.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chargeback-evidence-${result.orderNumber.replace("#", "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <s-page heading="Chargeback Evidence Builder">
      <s-paragraph slot="subtitle">
        Generate a professional dispute evidence package for any order in 60 seconds.
        You keep 100% of every win.
      </s-paragraph>

      {/* Section 2 — How it works */}
      <s-section heading="How it works">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>1</div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Enter your order ID</div>
            <div style={{ color: "#6d7175", fontSize: "13px" }}>Find it in Shopify Admin under Orders</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>2</div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>We compile all evidence from Shopify</div>
            <div style={{ color: "#6d7175", fontSize: "13px" }}>AVS, CVV, risk score, tracking, addresses and more</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>3</div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>Download your PDF and submit to your bank</div>
            <div style={{ color: "#6d7175", fontSize: "13px" }}>Works with any payment processor</div>
          </div>
        </div>
      </s-section>

      {/* Section 3 — Order lookup */}
      <s-section heading="Generate evidence package">
        <s-stack direction="block" gap="base">
          <s-text-field
            ref={inputRef}
            label="Order ID"
            placeholder="#1042"
            helpText="Enter the order number (e.g. #1042). Find it in Shopify Admin → Orders."
            disabled={isLoading}
            autoComplete="off"
          />

          {hasError && (
            <s-banner tone="critical">
              <s-paragraph>
                Order not found. Check the order ID and try again. Make sure you are
                using the order ID (a number) not the order name.
              </s-paragraph>
            </s-banner>
          )}

          <s-button
            variant="primary"
            onClick={handleSearch}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Loading order data..." : "Generate evidence package"}
          </s-button>
        </s-stack>
      </s-section>

      {/* Section 4 — Result card */}
      {result && (
        <s-section heading="Order found — ready to generate">
          <s-stack direction="block" gap="base">
            <s-stack direction="block" gap="tight">
              <s-stack direction="inline" gap="base">
                <s-text fontWeight="bold">Order:</s-text>
                <s-text>{result.orderNumber}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text fontWeight="bold">Customer:</s-text>
                <s-text>{result.customerName}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text fontWeight="bold">Date:</s-text>
                <s-text>{result.orderDate}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text fontWeight="bold">Total:</s-text>
                <s-text>{result.amount}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text fontWeight="bold">Risk level:</s-text>
                <RiskBadge level={result.riskLevel} />
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text fontWeight="bold">Fulfillment:</s-text>
                <s-text>{result.fulfillmentStatus}</s-text>
              </s-stack>
            </s-stack>

            {subscribed ? (
              <s-button
                variant="primary"
                onClick={handleDownload}
                loading={downloading}
                disabled={downloading}
              >
                {downloading ? "Generating PDF..." : "Download PDF Evidence Package"}
              </s-button>
            ) : (
              <>
                <s-banner tone="info">
                  <s-paragraph slot="heading">Start your 7-day free trial</s-paragraph>
                  <s-paragraph>
                    Download unlimited chargeback evidence packages for $19/month.
                    Keep 100% of every dispute you win.
                  </s-paragraph>
                  <s-button
                    slot="primaryAction"
                    onClick={() => {
                      submit(
                        { _action: "start_billing" },
                        { method: "post", action: "/app?index" },
                      );
                    }}
                  >
                    Start free trial — no charge for 7 days
                  </s-button>
                </s-banner>
                <s-tooltip content="Start your free trial to download evidence packages">
                  <s-button variant="primary" disabled>
                    Download PDF Evidence Package
                  </s-button>
                </s-tooltip>
              </>
            )}
          </s-stack>
        </s-section>
      )}

      {/* Section 5 — Trust statement */}
      <s-section>
        <s-text tone="subdued">
          ChargebackReady only reads your order data — it never writes to your store,
          never processes refunds, and never touches your payment settings.
          Works with Shopify Payments, PayPal, Stripe, Klarna, and any other processor.
        </s-text>
      </s-section>
    </s-page>
  );
}
