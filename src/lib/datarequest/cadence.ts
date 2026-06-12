// Pure reminder-cadence rule (no I/O) so it's easy to reason about and test.
// The cron route applies this per contact and sends at most one email per run.
import type { Campaign, Contact } from "./types";

export const REMINDER_INTERVAL_DAYS = 3; // wait this long between emails
export const MAX_REMINDERS = 3;          // reminders after the initial request
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReminderDecision {
  send: boolean;
  reminderNo: number; // 1-based: which reminder this would be
  final: boolean;     // drives "final reminder" copy
}

const NONE: ReminderDecision = { send: false, reminderNo: 0, final: false };

// Should this contact get a reminder right now?
export function dueReminder(contact: Contact, campaign: Campaign, now: Date = new Date()): ReminderDecision {
  if (contact.status === "received") return NONE;        // done — never chase
  if (contact.remindersSent >= MAX_REMINDERS) return NONE; // cap reached
  if (!contact.lastEmailedAt) return NONE;               // no cadence clock yet

  const daysSinceLast = (now.getTime() - new Date(contact.lastEmailedAt).getTime()) / DAY_MS;
  if (daysSinceLast < REMINDER_INTERVAL_DAYS) return NONE;

  const reminderNo = contact.remindersSent + 1;
  const deadlineSoon = campaign.deadline
    ? (new Date(campaign.deadline).getTime() - now.getTime()) / DAY_MS <= 1
    : false;
  const final = reminderNo >= MAX_REMINDERS || deadlineSoon;

  return { send: true, reminderNo, final };
}
