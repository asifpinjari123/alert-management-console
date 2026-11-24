/* Limits the utility test runner to one worker.
   This avoids fork startup timeouts on constrained Windows environments. */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads',
    isolate: false,
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
  },
});
