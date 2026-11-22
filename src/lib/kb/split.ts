// Splits a merged ticket into the problems its reports hold, counted with the desk's own view:
// causes.ts files every report by tenant and channel (as the cause table does), and the desk's notes
// (desk-notes.json) name the reports it read as a one-day move. Those stay counted where they are
// filed, and are also shown as a problem of their own, because their fix is a different one.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  // For a problem counted inside another one: the cause its reports are filed under.
  filedUnder: Problem | null;
  tenants: string[];
  channels: Record<string, number>;
  // What intake tagged these reports as: tag -> count.
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const tally = (rs: Report[], key: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});

function row(problem: Problem, rs: Report[], filedUnder: Problem | null): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    filedUnder,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: tally(rs, (r) => r.channel),
    taggedAs: tally(rs, (r) => r.meta.intakeTag),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { total: number; rows: ProblemRow[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => row(g.cause, g.reports, null));
  for (const g of groups) {
    if (readAs(g, oneDayMove) === 0) continue;
    rows.push(row('one-day', g.reports.filter((r) => oneDayMove.includes(r.id)), g.cause));
  }
  return { total: merged.length, rows };
}
