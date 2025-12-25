/**
 * Simple in-memory job queue for processing calls sequentially
 * This prevents rate limiting issues with Gemini API
 */

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Job {
  id: string;
  callId: string;
  type: 'audio' | 'transcript';
  status: JobStatus;
  data: Record<string, unknown>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

type JobProcessor = (job: Job) => Promise<void>;

class ProcessingQueue {
  private queue: Job[] = [];
  private isProcessing = false;
  private processor: JobProcessor | null = null;
  private concurrency = 1; // Process one job at a time to avoid rate limits

  /**
   * Set the job processor function
   */
  setProcessor(processor: JobProcessor): void {
    this.processor = processor;
  }

  /**
   * Add a job to the queue
   */
  addJob(callId: string, type: 'audio' | 'transcript', data: Record<string, unknown>): string {
    const job: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callId,
      type,
      status: 'pending',
      data,
      createdAt: new Date(),
    };

    this.queue.push(job);
    console.log(`[Queue] Added job ${job.id} for call ${callId}. Queue length: ${this.queue.length}`);

    // Start processing if not already running
    this.processNext();

    return job.id;
  }

  /**
   * Get queue status
   */
  getStatus(): { queueLength: number; isProcessing: boolean; jobs: Job[] } {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      jobs: this.queue.map(j => ({ ...j })),
    };
  }

  /**
   * Get position of a call in the queue
   */
  getCallPosition(callId: string): number {
    const index = this.queue.findIndex(j => j.callId === callId && j.status === 'pending');
    return index === -1 ? -1 : index + 1;
  }

  /**
   * Process the next job in the queue
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    if (!this.processor) {
      console.error('[Queue] No processor set');
      return;
    }

    const pendingJob = this.queue.find(j => j.status === 'pending');
    if (!pendingJob) {
      return;
    }

    this.isProcessing = true;
    pendingJob.status = 'processing';
    pendingJob.startedAt = new Date();

    console.log(`[Queue] Processing job ${pendingJob.id} for call ${pendingJob.callId}`);

    try {
      await this.processor(pendingJob);
      pendingJob.status = 'completed';
      pendingJob.completedAt = new Date();
      console.log(`[Queue] Completed job ${pendingJob.id}`);
    } catch (error) {
      pendingJob.status = 'failed';
      pendingJob.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Queue] Failed job ${pendingJob.id}:`, error);
    }

    // Remove completed/failed jobs from queue (keep last 10 for debugging)
    this.cleanup();

    this.isProcessing = false;

    // Process next job
    setImmediate(() => this.processNext());
  }

  /**
   * Cleanup old completed/failed jobs
   */
  private cleanup(): void {
    const completedOrFailed = this.queue.filter(j => j.status === 'completed' || j.status === 'failed');
    if (completedOrFailed.length > 10) {
      // Remove oldest completed/failed jobs, keep last 10
      const toRemove = completedOrFailed.slice(0, completedOrFailed.length - 10);
      this.queue = this.queue.filter(j => !toRemove.includes(j));
    }
  }
}

// Export singleton instance
export const processingQueue = new ProcessingQueue();
