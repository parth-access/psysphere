/** Logs each step as it finishes, so a request that stalls still shows the last step it reached. */
export function stepTimer(name: string) {
  const id = crypto.randomUUID().slice(0, 8);
  const region = process.env.VERCEL_REGION ?? "local";
  const start = performance.now();
  let last = start;
  return (step: string) => {
    const now = performance.now();
    console.log(`[timing] ${name} ${id} ${region} ${step}: ${Math.round(now - last)}ms (total ${Math.round(now - start)}ms)`);
    last = now;
  };
}
