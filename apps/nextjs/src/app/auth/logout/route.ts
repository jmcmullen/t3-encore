import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function POST() {
  cookies().delete("auth-token");
  return redirect("/");
}
