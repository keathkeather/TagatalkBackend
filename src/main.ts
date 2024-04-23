import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';


// const httpsOptions = {
//   key: fs.readFileSync('./src/cert/key.pem'),
//   cert: fs.readFileSync('./src/cert/cert.pem'),
// };


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  await app.listen(3000);
}
bootstrap();
