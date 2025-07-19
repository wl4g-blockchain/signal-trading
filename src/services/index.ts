import { ApiService, HttpApiService } from './api_service';
import { MockApiService } from './mock_service';

export type ApiType = 'MOCK' | 'API';

class ServiceManager {
  private currentService: ApiService;
  private apiType: ApiType = 'MOCK';

  constructor() {
    this.currentService = new MockApiService();
  }

  switchService(type: ApiType) {
    this.apiType = type;
    switch (type) {
      case 'API':
        this.currentService = new HttpApiService();
        break;
      case 'MOCK':
      default:
        this.currentService = new MockApiService();
        break;
    }
  }

  getService(): ApiService {
    return this.currentService;
  }

  getCurrentApiType(): ApiType {
    return this.apiType;
  }
}

export const serviceManager = new ServiceManager();
export type { ApiService } from './api_service';