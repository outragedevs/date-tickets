<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/tickets-4471.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket } from '#lib/kb/split';

  let { ticket }: { ticket: number } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const causes = $derived(split.rows.filter((r) => r.filedUnder === null));
  const filed = $derived(causes.reduce((n, g) => n + g.reports.length, 0));
  const ref = (p: string) => (tickets as Record<string, { issue: number; url: string; title: string }>)[p];
  const list = (m: Record<string, number>) =>
    Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{split.total}</strong> reports merged into #{ticket} ·
  <strong>{split.rows.length}</strong> problems ·
  {filed === split.total ? 'every report filed under one cause' : `${split.total - filed} reports not placed`}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>ticket</th><th>tenants</th><th>came in by</th><th>intake tagged</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each split.rows as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong>{#if g.filedUnder}<span class="small"> · filed under <code>{g.filedUnder}</code></span>{/if}</td>
        <td>{#if ref(g.problem)}<a href={ref(g.problem).url}>#{ref(g.problem).issue}</a>{:else}<span class="none">none yet</span>{/if}</td>
        <td>{g.tenants.length}</td>
        <td class="small">{list(g.channels)}</td>
        <td class="small">{list(g.taggedAs)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
