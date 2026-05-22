import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useRouteError } from "react-router";

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

  const { redirect } = await authenticate.admin(request);
  return redirect("/app");
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export default function BillingPage() {
  return null;
}
