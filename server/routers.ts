import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { searchRouter } from "./search-router";
import { authRouter } from "./auth-router";

export const appRouter = router({
  system: systemRouter,
  search: searchRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: authRouter._def.procedures.register,
    login: authRouter._def.procedures.login,
    requestPasswordReset: authRouter._def.procedures.requestPasswordReset,
    verifyTempPasswordAndSetNew: authRouter._def.procedures.verifyTempPasswordAndSetNew,
    updatePhone: authRouter._def.procedures.updatePhone,
    getUserByEmail: authRouter._def.procedures.getUserByEmail,
  }),
});

export type AppRouter = typeof appRouter;
