import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export const buildSwaggerConfig = (): Omit<OpenAPIObject, 'paths'> => {
  const config = new DocumentBuilder()
    .setTitle('Motorbike Rescue Endpoints')
    .setDescription('Motorbike Rescue API description')
    .setVersion('1.0')
    .build();
  return config;
};
