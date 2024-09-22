import { env } from "~/env";
import Client, { Environment } from "./client";

const getRequestClient = () => {
  const clientEnv = env.NEXT_PUBLIC_ENCORE_URL || Environment("production");

  return new Client(clientEnv, {});
};

export default getRequestClient;
