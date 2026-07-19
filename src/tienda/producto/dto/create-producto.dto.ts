import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsObject, IsArray, Min, Max, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize, IsInt } from 'class-validator';
import { BaseExtendedDto } from './../../../common/base/dto/base.dto';
import { DTO_MESSAGES, withDtoContext } from './../../../common/resource/dto.messages';

export class CreateProductoDto extends BaseExtendedDto {


  @IsInt()
  @IsOptional()
  idproducto?: number;

  @IsOptional()
  codigo?: string;

  @IsNotEmpty(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY))
  @IsString(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING))
  photo: string;

  @IsNotEmpty(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY))
  caracteristicas: Record<string, any>;
}
