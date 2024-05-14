import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as session from 'express-session';

const port = process.env.PORT || 3000;


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    }),
  )
  app.use(passport.initialize())
  app.use(passport.session());
  app.enableCors()
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
