import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "reset stuck tasks",
  { minutes: 10 },
  internal.watchdog.resetStuckTasks
);

export default crons;
