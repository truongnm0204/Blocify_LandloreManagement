import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { FlatRoomController } from './flat-room.controller';

@Module({
  controllers: [RoomController, FlatRoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
