import { useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing } = await authenticate.admin(request);

  const url = new URL(request.url);
  const returnUrl = `https://${url.host}/app`;

  await billing.require({
    plans: ["ChargebackReady Pro"],
    isTest: true,
    onFailure: async () => billing.request({
      plan: "ChargebackReady Pro",
      isTest: true,
      returnUrl,
    }),
  });

  return null;
};

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export default function BillingPage() {
  return null;
}
