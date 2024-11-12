import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../auth/passport/roles.guard';
import { UserModule } from '../user/user.module';
import { AuctionsModule } from '../auctions/auctions.module';
@Module({
  imports: [TypeOrmModule.forFeature([Category]), UserModule, AuctionsModule], // Đảm bảo đã thêm repository vào đây
  providers: [CategoriesService, JwtAuthGuard, RolesGuard],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
