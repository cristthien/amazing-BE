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
    .addTag('0 - Health', 'Endpoints for user accounts')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
