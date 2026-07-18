import { PartialType } from '@nestjs/swagger';
import { CreateBlockedDto } from './create-blocked.dto';

export class UpdateBlockedDto extends PartialType(CreateBlockedDto) {}
