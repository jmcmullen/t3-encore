import { cookies } from "next/headers";

import { env } from "~/env";
import Client, { Environment } from "./client";

/**
 * Returns the Encore request client for either the local or production environment.
 * If we are running the frontend locally (development) we assume that our Encore backend is also running locally
 * and make requests to that, otherwise we use the production client.
 */
const getRequestClient = () => {
  const token = cookies().get("auth_session")?.value ?? "";
  const clientEnv =
    env.NODE_ENV === "development"
      ? "http://127.0.0.1:4000"
      : Environment("production");

  return new Client(clientEnv, {
    auth: { authorization: `Bearer ${token}` },
  });
};

export default getRequestClient;
