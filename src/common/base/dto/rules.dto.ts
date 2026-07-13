import { MethodEnum } from '../../enum/method.enum';
import { KindEnum } from '../../enum/kind.enum';

export class RulesDto {
  method: MethodEnum;
  comparisonKind: KindEnum;
  field: string[];
}
