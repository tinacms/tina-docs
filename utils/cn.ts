import { twMerge } from "tailwind-merge";

export const cn = (...inputs: (string | undefined)[]) => {
  return twMerge(inputs.filter(Boolean));
};
