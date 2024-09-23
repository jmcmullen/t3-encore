import { z } from "zod";

export interface SignUpParams {
  /** Email of the user */
  email: string;
  /** Name of the user */
  name: string;
  /** Password of the user */
  password: string;
}

export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(3, "Name must contain at least 8 characters"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

export interface SignInParams {
  /** Email of the user */
  email: string;
  /** Password of the user */
  password: string;
}
