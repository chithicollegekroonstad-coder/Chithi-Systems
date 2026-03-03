// lib/jwt.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables. Please add it to .env.local");
}

export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET as string, { expiresIn: "30d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET as string);
  } catch (error) {
    throw new Error("Invalid token");
  }
}