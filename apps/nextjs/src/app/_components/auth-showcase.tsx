import { cookies } from "next/headers";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { getBaseUrl } from "../lib/base-url";
import getRequestClient from "../lib/getRequestClient";

export async function AuthShowcase() {
  const baseUrl = getBaseUrl();
  const encoreUrl = `${getBaseUrl()}/api/encore`;
  const token = cookies().get("auth_session")?.value ?? "";
  const encoreClient = getRequestClient();
  const { user, session } = await encoreClient.iam.currentUser({
    authorization: `Bearer ${token}`,
  });

  if (!session || !user) {
    return (
      <form>
        <Link href={`${encoreUrl}/auth/discord?redirect=${baseUrl}`}>
          <Button size="lg">Sign in with Discord</Button>
        </Link>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        <span>Logged in as {user.name}</span>
      </p>

      <form>
        <Link href={`${encoreUrl}/auth/logout?redirect=${baseUrl}`}>
          <Button size="lg">Sign out</Button>
        </Link>
      </form>
    </div>
  );
}
