import { env } from "process";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { Environment } from "../lib/client";
import getRequestClient from "../lib/getRequestClient";

export async function AuthShowcase() {
  const encoreClient = getRequestClient();
  const { user, session } = await encoreClient.iam.currentUser({});
  const baseUrl =
    env.NODE_ENV === "development"
      ? "http://127.0.0.1:4000"
      : Environment("production");

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
        <Link href={`${baseUrl}/auth/discord`}>
          <Button size="lg">Sign out</Button>
        </Link>
      </form>
    </div>
  );
}
