import type { NextApiResponse } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import getRequestClient from "../../lib/getRequestClient";

interface ResponseData {
  message: string;
}

export async function POST(req: Request, _res: NextApiResponse<ResponseData>) {
  const data = await req.formData();
  const email = (data.get("email") as string) || "incognito";
  const password = (data.get("password") as string) || "password";

  try {
    const client = getRequestClient();
    const response = await client.auth.login({ email, password });
    cookies().set("auth-token", response.token);
  } catch (error) {
    console.error("Error logging in", error);
  }

  return redirect("/");
}
