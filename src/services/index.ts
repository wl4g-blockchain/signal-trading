import { ApiService, HttpApiService } from './api_service';
import { MockApiService } from './mock_service';

export type ServiceType = 'mock' | 'http';

class ServiceManager {
  private currentService: ApiService;
  private serviceType: ServiceType = 'mock';

  constructor() {
    this.currentService = new MockApiService();
  }

  switchService(type: ServiceType) {
    this.serviceType = type;
    switch (type) {
      case 'http':
        this.currentService = new HttpApiService();
        break;
      case 'mock':
      default:
        this.currentService = new MockApiService();
        break;
    }
  }

  getService(): ApiService {
    return this.currentService;
  }

  getCurrentServiceType(): ServiceType {
    return this.serviceType;
  }
}

export const serviceManager = new ServiceManager();
export type { ApiService } from './api_service';