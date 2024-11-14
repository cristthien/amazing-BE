// src/auctions/tasks/auction-tasks.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuctionsService } from '../auctions.service';

@Injectable()
export class AuctionTasksService implements OnModuleInit {
  constructor(private readonly auctionsService: AuctionsService) {}

  async onModuleInit() {
    const { target_time } = await this.auctionsService.getNearestEndDate();

    // Lập lịch tác vụ tại thời điểm đó
    this.scheduleTaskAt(target_time);
  }
  async handleEndofAuction(end_date: Date) {
    await this.auctionsService.updateStatusByEndDate(end_date);
    const { target_time } = await this.auctionsService.getNearestEndDate();
    return this.scheduleTaskAt(target_time);
  }

  async scheduleTaskAt(targetTime: Date) {
    const now = new Date();
    const delay = targetTime.getTime() - now.getTime(); // Tính khoảng thời gian chờ

    if (delay <= 0) {
      await this.handleEndofAuction(targetTime);
    }

    // Đặt setTimeout để chạy tác vụ vào thời điểm đích
    setTimeout(async () => {
      return await this.handleEndofAuction(targetTime);
    }, delay);
  }
}
