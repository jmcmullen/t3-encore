import { hash, verify } from "@node-rs/argon2";

const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export const hashPassword = async (password: string) => {
  return await hash(password, HASH_OPTIONS);
};

export const verifyPassword = async (
  hashedPassword: string,
  password: string,
) => {
  return await verify(hashedPassword, password, HASH_OPTIONS);
};
