import { Job } from "bullmq";
import type { jobDetail } from "../types.js";
export declare class WorkerService {
    private dexService;
    /**
     * Processes an order job through the complete lifecycle
     */
    processOrder(job: Job<jobDetail>): Promise<any>;
    private fetchQuotesWithLogging;
    private compareQuotes;
    private executeSwap;
}
//# sourceMappingURL=worker.service.d.ts.map