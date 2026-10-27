import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [InvoiceModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
