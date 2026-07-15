import { Injectable } from '@nestjs/common';
import { BaseServiceCRUD } from 'src/common/base/class/base.service.crud.class';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ReturnDto } from 'src/common/base/dto';
import { CodeEnum } from 'src/common/enum/code.enum';
import { UpdateStateNotificationDto } from './dto/update-read-notification.dto';
import { MessageCodes } from 'src/common/enum/messageCodes.enum';
import { ResourceEnum } from 'src/common/enum/resource.enum';

@Injectable()
export class NotificationsService extends BaseServiceCRUD<
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto
> {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {
    super(repository);
  }
  async updateReadStatus(dto: UpdateStateNotificationDto): Promise<ReturnDto> {
     const notification = await this.repository.findOne({
      where: { id: dto.notificationId },
    });

    if (!notification) {
      return this.getReturn(false, CodeEnum.NOT_FOUND, null, CodeEnum.NOT_FOUND, ResourceEnum.NOTIFICATION_NOT_FOUND, MessageCodes.NOTIFICATION_NOT_FOUND, CodeEnum.NOT_FOUND);
    }

    const destination = notification.destinyUser.find(
      (dest) => dest.id === dto.destinationId,
    );

    if (!destination) {
      return this.getReturn(false, CodeEnum.NOT_FOUND, null, CodeEnum.NOT_FOUND, ResourceEnum.NOTIFICATION_NOT_FOUND, MessageCodes.NOTIFICATION_NOT_FOUND, CodeEnum.NOT_FOUND);
    }
    
    destination.isReaded = dto.isReaded;
    const data = await this.repository.save(notification);
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
  }
  async GetAll(): Promise<ReturnDto> {
    const data = await this.repository.find({});
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
  }
}