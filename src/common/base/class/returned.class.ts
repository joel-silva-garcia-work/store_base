import { CodeEnum } from "src/common/enum/code.enum";
import { ReturnDto } from "../dto";

export class returnClass {


    public async getReturn(
        isSuccess: boolean,
        returnCode: CodeEnum,
        data: Object,
        errorCode: any,
        errorMessage: string,
        returnMessageCode: any,
        requestCode: any
    ): Promise<ReturnDto>{
    const returnDTO =  new ReturnDto

    returnDTO.isSuccess = isSuccess
    returnDTO.returnCode = returnCode
    returnDTO.data = data
    returnDTO.errorCode = errorCode
    returnDTO.errorMessage = errorMessage
    returnDTO.returnMessageCode = returnMessageCode
    returnDTO.requestCode = requestCode

    return returnDTO
    }
}