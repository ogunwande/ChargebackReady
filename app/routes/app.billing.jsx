import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing } = await authenticate.admin(request);

  await billing.require({
    plans: ["ChargebackReady Pro"],
    isTest: true,
    onFailure: async () => billing.request({
      plan: "ChargebackReady Pro",
    }),
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/app" },
  });
};

export default function BillingPage() {
  return null;
}
