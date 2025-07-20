import { ApiService } from './APIService';
import { HttpApiService } from './HttpService';
import { MockApiService } from './MockService';

export type ApiType = 'MOCK' | 'API';

class APIServiceFacade {
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

export const apiServiceFacade = new APIServiceFacade();
export type { ApiService } from './APIService';
