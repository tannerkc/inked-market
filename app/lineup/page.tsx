import { createClient } from "@/lib/supabase/server";
import { LineupPageContent } from "@/components/lineup/lineup-page-content";
import {
  getCurrentIssueFromDb,
  getAllSpotlightsFromDb,
  getAllEventsFromDb,
} from "@/lib/data/supabase-lineup";
import {
  lineupIssues,
  getCurrentIssue,
  getAllSpotlights,
  getAllEvents,
} from "@/lib/data/lineup";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function LineupPage() {
  // Mock defaults; overridden when the DB has a fully-assembled current issue.
  let issue = getCurrentIssue();
  let spotlights = getAllSpotlights();
  let events = getAllEvents();
  let issues: typeof lineupIssues | undefined = lineupIssues;
  let isSample = true;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const [dbIssue, dbSpotlights, dbEvents] = await Promise.all([
        getCurrentIssueFromDb(supabase),
        getAllSpotlightsFromDb(supabase),
        getAllEventsFromDb(supabase),
      ]);
      if (dbIssue && dbSpotlights.length > 0) {
        issue = dbIssue;
        spotlights = dbSpotlights;
        events = dbEvents;
        issues = undefined; // no archive table yet; single current issue
        isSample = false;
      }
    } catch {
      // Supabase not configured / empty — keep mock defaults.
    }
  }

  return (
    <LineupPageContent
      issue={issue}
      spotlights={spotlights}
      events={events}
      issues={issues}
      isSample={isSample}
    />
  );
}
