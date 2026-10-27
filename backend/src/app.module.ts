import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { MotelModule } from "./modules/motel/motel.module";
import { RoomModule } from "./modules/room/room.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { ContractModule } from "./modules/contract/contract.module";
import { MeterReadingModule } from "./modules/meter-reading/meter-reading.module";
import { InvoiceModule } from "./modules/invoice/invoice.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { UploadModule } from "./modules/upload/upload.module";
import { VehicleModule } from "./modules/vehicle/vehicle.module";
import { ExpenseModule } from "./modules/expense/expense.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { ReconciliationModule } from "./modules/reconciliation/reconciliation.module";

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    MotelModule,
    RoomModule,
    TenantModule,
    ContractModule,
    MeterReadingModule,
    InvoiceModule,
    PaymentModule,
    FeedbackModule,
    DashboardModule,
    UploadModule,
    VehicleModule,
    ExpenseModule,
    SchedulerModule,
    ReconciliationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}