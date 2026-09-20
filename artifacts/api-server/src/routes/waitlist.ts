import { Router, type IRouter } from "express";
import { db, waitlistTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const joinWaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
});

router.post("/waitlist", async (req, res) => {
  try {
    const parseResult = joinWaitlistSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Bad Request",
        message: parseResult.error.errors[0]?.message || "Invalid email address",
      });
      return;
    }

    const { email } = parseResult.data;

    try {
      await db.insert(waitlistTable).values({ email }).onConflictDoNothing();
    } catch (dbError: any) {
      req.log?.error({ err: dbError }, "Database insertion failed");
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to add to waitlist. Please try again later.",
        detail: dbError?.message || String(dbError),
      });
      return;
    }

    res.json({
      status: "success",
      message: "You've been added to the waitlist!",
      email,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Unexpected error in /waitlist");
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
});

export default router;
