<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/split';

  // One problem's reports: how many, from which tenants, and (for small groups) which ids.
  let { ticket, problem, ids = false }: { ticket: number; problem: Problem; ids?: boolean } = $props();

  const g = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove).rows.find((x) => x.problem === problem));
</script>

{#if g}
  <p class="small">
    <strong>{g.reports.length}</strong> reports from {g.tenants.length} tenants:
    {g.tenants.map((t) => `${t} (${tenantOf({ tenant: t })?.locale ?? '?'}, ${tenantOf({ tenant: t })?.form ?? '?'})`).join(', ')}.
    {#if ids}Reports: {g.reports.map((r) => r.id).join(', ')}.{/if}
  </p>
{:else}
  <p class="small">No reports in <code>{problem}</code>.</p>
{/if}

<style>
  .small { color: var(--muted); font-size: 0.9em; }
</style>
