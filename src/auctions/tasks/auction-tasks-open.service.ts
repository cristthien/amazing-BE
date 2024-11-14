// src/auctions/tasks/auction-tasks.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuctionsService } from '../auctions.service';

@Injectable()
export class AuctionTasksOpenService implements OnModuleInit {
  constructor(private readonly auctionsService: AuctionsService) {}

  async onModuleInit() {
    const { target_time } = await this.auctionsService.getNearestStartDate();
    // Lập lịch tác vụ tại thời điểm đó
    this.scheduleTaskAt(target_time);
  }
  async handleStartofAuction(startDate: Date) {
    await this.auctionsService.updateStatusByStartDate(startDate);
    const { target_time } = await this.auctionsService.getNearestStartDate();
    return this.scheduleTaskAt(target_time);
  }

  async scheduleTaskAt(targetTime: Date) {
    if (targetTime == null) {
      return;
    }
    const now = new Date();
    const delay = targetTime.getTime() - now.getTime(); // Tính khoảng thời gian chờ

    if (delay <= 0) {
      await this.handleStartofAuction(targetTime);
    }

    // Đặt setTimeout để chạy tác vụ vào thời điểm đích
    setTimeout(async () => {
      return await this.handleStartofAuction(targetTime);
    }, delay);
  }
}
