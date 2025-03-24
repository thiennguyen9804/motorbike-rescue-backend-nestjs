import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { buildSwaggerConfig } from './utils/swagger';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = buildSwaggerConfig();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
