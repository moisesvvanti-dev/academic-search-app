import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const authRouter = router({
  // Register new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.registerUser(input.email, input.password, input.phone);
      if (!user) {
        throw new Error("Registration failed. Email may already exist.");
      }
      return {
        id: user.id,
        email: user.email,
        message: "User registered successfully",
      };
    }),

  // Login user
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.loginUser(input.email, input.password);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      return {
        id: user.id,
        email: user.email,
        message: "Login successful",
      };
    }),

  // Request password reset (sends SMS with temp password)
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.phone) {
        throw new Error("Phone number not registered. Please update your profile.");
      }

      const reset = await db.generatePasswordReset(user.id, user.phone);
      if (!reset) {
        throw new Error("Failed to generate reset token");
      }

      return {
        message: "Temporary password sent to your phone",
        expiresAt: reset.expiresAt,
      };
    }),

  // Verify temp password and set new password
  verifyTempPasswordAndSetNew: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        tempPassword: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const success = await db.verifyTempPasswordAndSetNew(
        input.userId,
        input.tempPassword,
        input.newPassword
      );

      if (!success) {
        throw new Error("Invalid or expired temporary password");
      }

      return { message: "Password changed successfully" };
    }),

  // Update phone number
  updatePhone: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        phone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await db.updateUserPhone(input.userId, input.phone);
      if (!success) {
        throw new Error("Failed to update phone number");
      }
      return { message: "Phone number updated" };
    }),

  // Get user by email (for login verification)
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
      };
    }),
});
