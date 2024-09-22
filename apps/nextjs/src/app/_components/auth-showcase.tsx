import { env } from "process";
import { cookies } from "next/headers";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { Environment } from "../lib/client";
import getRequestClient from "../lib/getRequestClient";

export async function AuthShowcase() {
  const baseUrl = env.NEXT_PUBLIC_ENCORE_URL ?? Environment("production");
  const token = cookies().get("auth_session")?.value ?? "";
  const encoreClient = getRequestClient();
  const { user, session } = await encoreClient.iam.currentUser({
    authorization: `Bearer ${token}`,
  });

  if (!session || !user) {
    return (
      <form>
        <Link href={`${baseUrl}/auth/discord`}>
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
        <Link href={`${baseUrl}/auth/logout`}>
          <Button size="lg">Sign out</Button>
        </Link>
      </form>
    </div>
  );
}
