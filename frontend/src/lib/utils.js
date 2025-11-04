import { clsx } from "clsx";
import { tv } from "tailwind-variants";

export function cn(...inputs) {
  return clsx(inputs);
}
