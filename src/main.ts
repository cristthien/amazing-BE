import { ResponseInterceptor } from './interceptors/response.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1', { exclude: [''] });
  const config = new DocumentBuilder()
    .setTitle('Amazing Online Shop API')
    .setDescription(
      'API documentation for Amazing Online Shop - a modern platform for purchasing the latest fashion and accessories. This API provides all necessary endpoints for managing products, users, orders, and more.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      // Adds JWT Bearer authentication
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'Bearer',
    )
    .addSecurityRequirements('Bearer')
    .addTag(
      '0 - Health',
      'Endpoints for health checks and resource availability',
    )
    .addTag('1 - Authentication', 'Endpoints for managing user authentication')
    .addTag('2 - Users', 'Endpoints for managing user information')
    .addTag(
      '3 - Categories',
      'Endpoints for retrieving and managing auction categories',
    )
    .addTag('4 - Auctions', 'Endpoints for creating and managing auctions')
    .addTag('5 - Bids', 'Endpoints for placing and managing bids on auctions')
    .addTag('6 - Wishlists', 'Endpoints for managing user wishlists')
    .addTag(
      '7 - Invoices',
      'Endpoints for handling invoice generation and management',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
