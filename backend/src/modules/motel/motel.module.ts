import { Module } from '@nestjs/common';
import { MotelService } from './motel.service';
import { MotelController } from './motel.controller';

@Module({
  controllers: [MotelController],
  providers: [MotelService],
  exports: [MotelService],
})
export class MotelModule {}
