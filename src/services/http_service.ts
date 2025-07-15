import { HttpApiService } from './api_service';

// HTTP service is just an alias for HttpApiService
export const httpService = new HttpApiService();
export { HttpApiService as HttpService };