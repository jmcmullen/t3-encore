import { redirect } from "next/navigation";

import type { admin, APIError } from "../lib/client";
import { ErrCode } from "../lib/client";
import getRequestClient from "../lib/getRequestClient";

export default async function Admin() {
  const client = getRequestClient();
  let response: admin.DashboardData | undefined;
  let error: APIError | undefined;

  try {
    response = await client.admin.getDashboardData();
  } catch (err) {
    error = err as APIError;
  }

  if (error) {
    if (error.code === ErrCode.Unauthenticated)
      redirect("/auth/unauthenticated?from=%2Fadmin");
    else throw error;
  }

  return (
    <section>
      <h1 className="text-3xl">Admin Dashboard</h1>
      <br />
      <p>{response?.value}</p>
    </section>
  );
}
