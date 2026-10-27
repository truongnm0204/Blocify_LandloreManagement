import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddContractTenantDto {
  @ApiProperty({ example: 'tenant-cuid-here' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
