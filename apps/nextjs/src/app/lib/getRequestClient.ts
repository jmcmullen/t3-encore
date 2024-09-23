import { getBaseUrl } from "./base-url";
import Client from "./client";

const getRequestClient = () => {
  const clientEnv = `${getBaseUrl()}/api/encore`;

  return new Client(clientEnv, {});
};

export default getRequestClient;
