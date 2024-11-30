// src/auctions/tasks/auction-tasks-active.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuctionCronService } from './cron-task.service';

@Injectable()
export class AuctionTasksActiveService implements OnModuleInit {
  private scheduledTaskTimeout: NodeJS.Timeout;
  constructor(private readonly auctionCronService: AuctionCronService) {
    this.scheduledTaskTimeout = null;
  }

  async onModuleInit() {
    await this.scheduleNextAuctionTask();
  }
  async scheduleNextAuctionTask() {
    const nearestAuction = await this.auctionCronService.getNearestStartDate();
    const { target_time } = nearestAuction;
    if (target_time) {
      await this.scheduleTaskAt(target_time);
    }
  }

  async handleStartOfAuction(end_date: Date) {
    // Cập nhật trạng thái khi auction kết thúc
    await this.auctionCronService.updateStatusByStartDate(end_date);
    // Lên lịch cho auction tiếp theo
    await this.scheduleNextAuctionTask();
  }

  async scheduleTaskAt(targetTime: Date) {
    // Nếu có một timeout đang chờ, xóa nó trước khi đặt timeout mới
    if (this.scheduledTaskTimeout) {
      clearTimeout(this.scheduledTaskTimeout);
    }

    const now = new Date();
    const delay = targetTime.getTime() - now.getTime();

    if (delay <= 0) {
      await this.handleStartOfAuction(targetTime); // Nếu đã đến thời điểm thì xử lý ngay lập tức
    } else {
      // Đặt timeout mới cho thời điểm đích và lưu lại trong `scheduledTaskTimeout`
      this.scheduledTaskTimeout = setTimeout(async () => {
        await this.handleStartOfAuction(targetTime);
      }, delay);
    }
  }
}
