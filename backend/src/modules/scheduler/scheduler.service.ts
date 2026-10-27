import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly invoiceService: InvoiceService) {}

  // Auto-generate invoices: 1st of month at 00:05
  @Cron('0 5 0 1 * *')
  async handleAutoGenerate() {
    this.logger.log('Starting auto invoice generation...');
    try {
      const result = await this.invoiceService.autoGenerateForAllMotels();
      this.logger.log(
        `Auto-generate complete: ${result.generated} created, ${result.skipped} skipped, ${result.failed} failed`,
      );
      if (result.errors.length > 0) {
        this.logger.warn(`Errors: ${result.errors.join('; ')}`);
      }
    } catch (err) {
      this.logger.error('Auto-generate failed', (err as Error).stack);
    }
  }

  // Auto-issue invoices: daily at 09:00
  @Cron('0 0 9 * * *')
  async handleAutoIssue() {
    this.logger.log('Starting auto invoice issuance...');
    try {
      const result = await this.invoiceService.autoIssueReadyInvoices();
      this.logger.log(
        `Auto-issue complete: ${result.issued} issued, ${result.failed} failed`,
      );
      if (result.errors.length > 0) {
        this.logger.warn(`Errors: ${result.errors.join('; ')}`);
      }
    } catch (err) {
      this.logger.error('Auto-issue failed', (err as Error).stack);
    }
  }
}
