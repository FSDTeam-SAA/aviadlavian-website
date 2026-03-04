import { z } from "zod";

export const otpSchema = z.object({
  otp: z.array(z.string().length(1, { message: "Required" })).length(6),
});
