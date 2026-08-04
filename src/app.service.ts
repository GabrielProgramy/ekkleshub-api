import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthAPI(): object {
    return {
      status: 'ok',
      service: 'ekkleshub-api',
    };
  }
}
