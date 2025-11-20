export class Logger {
  static info(jobId: string, message: string, data?: any) {
    console.log(`[INFO] [Job: ${jobId}] ${message}`, data || '');
  }

  static error(jobId: string, message: string, error?: any) {
    console.error(`[ERROR] [Job: ${jobId}] ${message}`, error || '');
  }

  static warn(jobId: string, message: string, data?: any) {
    console.warn(`[WARN] [Job: ${jobId}] ${message}`, data || '');
  }
}