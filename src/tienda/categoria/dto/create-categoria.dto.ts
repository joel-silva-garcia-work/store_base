import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsObject, IsArray, Min, Max, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from './../../../common/base/dto/base.dto';
import { DTO_MESSAGES, withDtoContext } from './../../../common/resource/dto.messages';

export class CreateCategoriaDto extends BaseExtendedDto {
  @IsNotEmpty(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY))
  @IsString(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING))
  icon: string;
}
