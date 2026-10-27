import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { RoomContractController } from './room-contract.controller';

@Module({
  controllers: [ContractController, RoomContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
