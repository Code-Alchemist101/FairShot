import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'FairShot API - Revolutionary Hiring Platform';
  }
}
