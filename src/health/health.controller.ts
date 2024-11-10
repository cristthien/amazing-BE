import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { Public } from '../common/decorator/customize';

@ApiTags('0 - Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly connection: Connection, // Inject connection vào controller
  ) {}

  @Get('check-db')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Request successful',
    schema: {
      example: {
        statusCode: 200,
        message: 'Request successful',
        data: 'Database connection is healthy!',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Database connection failed',
    schema: {
      example: {
        statusCode: 500,
        message: 'Database connection failed: [error message]',
        error: 'HttpException',
      },
    },
  })
  async checkDbConnection(): Promise<any> {
    try {
      // Kiểm tra các bảng có sẵn trong schema 'public'
      await this.connection.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Request successful',
        data: 'Database connection is healthy!',
      };
    } catch (e) {
      // Ném lỗi để interceptor xử lý
      throw new HttpException(
        {
          message: `Database connection failed: ${e.message}`,
          error: 'HttpException',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
