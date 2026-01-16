import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Application successfully started!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`🌐 API Base URL: http://localhost:${port}/api/v1`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(60)}\n`);

  logger.log(`Application listening on port ${port}`);
  logger.log('All loggers are enabled and console logs are active');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
