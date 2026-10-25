import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET_KEY = process.env.JWT_SECRET || "instalite-secret-key";
const ROUNDS = 12;

export async function encryptPass(rawPass) {
  return bcrypt.hash(rawPass, ROUNDS);
}

export async function matchPass(rawPass, hashedPass) {
  return bcrypt.compare(rawPass, hashedPass);
}

export function createToken(userData) {
  return jwt.sign(userData, SECRET_KEY, { expiresIn: "7d" });
}

export function decodeToken(tok) {
  return jwt.verify(tok, SECRET_KEY);
}
