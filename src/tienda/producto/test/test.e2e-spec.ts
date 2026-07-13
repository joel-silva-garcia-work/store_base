import {
  createData,
  fetchActiveItems,
  fetchData,
  fetchItemById,
  HttpError,
  InvalidStandardDTO,
  login,
  updateData,
  updateState,
  validateTest,
} from './../../../common/base/test/test.helper'
import { IdDto } from '../../../common/base/dto/id.dto'

const randomString = (len = 8) =>
  Math.random()
    .toString(36)
    .slice(2, 2 + len)

export enum INVALID_DTO {
  NULL_STOCK = 'NULL_STOCK',
  NO_STOCK = 'NO_STOCK',
  WRONG_STOCK_TYPE = 'WRONG_STOCK_TYPE',
  NULL_PHOTO = 'NULL_PHOTO',
  NO_PHOTO = 'NO_PHOTO',
  EMPTY_PHOTO = 'EMPTY_PHOTO',
  WRONG_PHOTO_TYPE = 'WRONG_PHOTO_TYPE',
  NULL_CARACTERISTICAS = 'NULL_CARACTERISTICAS',
  NO_CARACTERISTICAS = 'NO_CARACTERISTICAS',
  WRONG_CARACTERISTICAS_TYPE = 'WRONG_CARACTERISTICAS_TYPE',
  NO_TOKEN = 'NO_TOKEN',
  NO_ID = 'NO_ID',
}

const generateDto = () => {
    name: `Producto ${randomString(10)}`,
    description: `Desc ${randomString(12)}`,
    isActive: true,
    stock: 1,
    photo: randomString(12),
    caracteristicas: { key: randomString(6) },
  }

const generateInvalidDTO = (invalid: InvalidStandardDTO | INVALID_DTO) => {
  const dto = generateDto()
  const invalidDto: any = { ...dto }

  switch (invalid) {
    case InvalidStandardDTO.NULL_NAME:
      invalidDto.name = null as any
      break
    case InvalidStandardDTO.EMPTY_NAME:
      invalidDto.name = '' as any
      break
    case InvalidStandardDTO.WRONG_NAME_TYPE:
      invalidDto.name = 123 as any
      break
    case InvalidStandardDTO.NO_NAME:
      delete invalidDto.name
      break
    case InvalidStandardDTO.WRONG_DESCRIPTION_TYPE:
      invalidDto.description = 123 as any
      break

        case INVALID_DTO.NULL_STOCK:
          invalidDto.stock = null as any;
          break;
        case INVALID_DTO.NO_STOCK:
          delete invalidDto.stock;
          break;
        case INVALID_DTO.WRONG_STOCK_TYPE:
          invalidDto.stock = "invalid" as any;
          break;
        case INVALID_DTO.NULL_PHOTO:
          invalidDto.photo = null as any;
          break;
        case INVALID_DTO.NO_PHOTO:
          delete invalidDto.photo;
          break;
        case INVALID_DTO.EMPTY_PHOTO:
          invalidDto.photo = "" as any;
          break;
        case INVALID_DTO.WRONG_PHOTO_TYPE:
          invalidDto.photo = 123 as any;
          break;
        case INVALID_DTO.NULL_CARACTERISTICAS:
          invalidDto.caracteristicas = null as any;
          break;
        case INVALID_DTO.NO_CARACTERISTICAS:
          delete invalidDto.caracteristicas;
          break;
        case INVALID_DTO.WRONG_CARACTERISTICAS_TYPE:
          invalidDto.caracteristicas = "invalid-json" as any;
          break;

    default:
      break
  }

  return invalidDto
}

const validateWrongTest = (
  testName: string,
  result: any,
  invalid: InvalidStandardDTO | INVALID_DTO,
) => {
  if (result instanceof HttpError) {
    expect(result).toBeInstanceOf(HttpError)
    switch (invalid) {
      case INVALID_DTO.NO_TOKEN:
        expect(result.status).toBe(401)
        break
      default:
        expect(result.status).toBe(400)
        break
    }
  } else {
    expect(result).toBeTruthy()
  }
}

describe('API Tests', () => {
  jest.setTimeout(9000000)
  let token: any
  let itemId: any
  const url = 'tienda/producto'

  describe('Basic CRUD', () => {
    test('should read all items', async () => {
      const todos = url + '/todos'
      const result = await fetchData(todos)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should create a new item', async () => {
      token = await login()
      const createUrl = url + '/adicionar'
      const dto = generateDto()
      const result = await createData(createUrl, dto, token)
      validateTest(expect.getState().currentTestName, result)

      if (result?.isSuccess) {
        itemId = result.data.id
      } else if (result?.data?.id) {
        itemId = result.data.id
      } else {
        throw new Error('Failed to create item')
      }
    })

    test('should get all active items', async () => {
      const todosActivos = url + '/ver-todos-activos-public'
      const result = await fetchActiveItems(todosActivos)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should get an item by ID', async () => {
      const uno = url + '/ver-uno-public'
      const ID = new IdDto()
      ID.id = itemId
      const result = await fetchItemById(uno, ID)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should get an active item by ID', async () => {
      const unoActivo = url + '/ver-uno-activo-public'
      const ID = new IdDto()
      ID.id = itemId
      const result = await fetchItemById(unoActivo, ID)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should set active/inactive item by ID', async () => {
      const changeStateUrl = url + '/cambiar-estado'
      const ID = new IdDto()
      ID.id = itemId
      const result = await updateState(changeStateUrl, ID, token)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should edit an item', async () => {
      const updateUrl = url + '/actualizar'
      const dto = generateDto()
      const updDto: any = { ...dto, id: itemId }
      const result = await updateData(updateUrl, updDto, token)
      validateTest(expect.getState().currentTestName, result)
    })
  })

  describe('Failed Cases', () => {
    describe('Failed Created Cases', () => {
      describe('Edge Cases', () => {
        test('should handle very long photo', async () => {
                const createUrl = url + '/adicionar'
                const dto: any = generateDto()
                dto.photo = 'a'.repeat(1000)
                const result = await createData(createUrl, dto, token)
                expect(result).toBeInstanceOf(HttpError)
                expect((result as HttpError).status).toBe(400)
              })
      })

      Object.values(InvalidStandardDTO).forEach((errorType) => {
        test(`should fail to create a new item: ${errorType}`, async () => {
          const dto = generateInvalidDTO(errorType)
          const createUrl = url + '/adicionar'
          const result = await createData(createUrl, dto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })

      Object.values(INVALID_DTO).forEach((errorType) => {
        if (errorType === INVALID_DTO.NO_ID) return
        test(`should fail to create a new item: ${errorType}`, async () => {
          const createUrl = url + '/adicionar'

          if (errorType === INVALID_DTO.NO_TOKEN) {
            const dto = generateDto()
            const result = await createData(createUrl, dto)
            validateWrongTest(expect.getState().currentTestName, result, errorType)
            return
          }

          const dto = generateInvalidDTO(errorType)
          const result = await createData(createUrl, dto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })
    })

    describe('Failed Edit Cases', () => {
      Object.values(InvalidStandardDTO).forEach((errorType) => {
        test(`should fail to edit an item: ${errorType}`, async () => {
          const updateUrl = url + '/actualizar'
          const dto = generateInvalidDTO(errorType)
          const updDto: any = { ...dto, id: itemId }
          const result = await updateData(updateUrl, updDto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })

      Object.values(INVALID_DTO).forEach((errorType) => {
        if (errorType === INVALID_DTO.NO_TOKEN) return
        test(`should fail to edit an item: ${errorType}`, async () => {
          const updateUrl = url + '/actualizar'

          if (errorType === INVALID_DTO.NO_ID) {
            const dto: any = generateDto()
            const result = await updateData(updateUrl, dto, token)
            validateWrongTest(expect.getState().currentTestName, result, errorType)
            return
          }

          const dto = generateInvalidDTO(errorType)
          const updDto: any = { ...dto, id: itemId }
          const result = await updateData(updateUrl, updDto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })

      test('should handle state change with non-existent ID', async () => {
        const stateUrl = url + '/cambiar-estado'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        const result = await updateState(stateUrl, ID, token)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(400)
      })

      test('should handle get one with non-existent ID', async () => {
        const uno = url + '/ver-uno-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        const result = await fetchItemById(uno, ID)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(400)
      })

      test('should handle get one active with non-existent ID', async () => {
        const unoActivo = url + '/ver-uno-activo-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        const result = await fetchItemById(unoActivo, ID)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(400)
      })
    })
  })
})
