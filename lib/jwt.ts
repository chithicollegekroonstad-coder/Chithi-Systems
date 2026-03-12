// lib/jwt.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_dev_secret";

export function signToken(payload: object): string {
  if (!SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  return jwt.sign(payload, SECRET as string, { expiresIn: "30d" });
}

export function verifyToken(token: string): any {
  if (!SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  try {
    return jwt.verify(token, SECRET as string);
  } catch (error) {
    throw new Error("Invalid token");
  }
}