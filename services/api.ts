
import { UnlockRequest, UnlockType, RequestStatus } from '../types';

// ==========================================
// LOCAL STORAGE API IMPLEMENTATION
// ==========================================
// The backend has been removed. This service now persists all data
// to the browser's Local Storage to simulate a database.

const STORAGE_KEY = 'unlockmate_requests';

const getLocalRequests = (): UnlockRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

const saveLocalRequests = (requests: UnlockRequest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 800));

export const api = {
  fetchRequests: async (): Promise<UnlockRequest[]> => {
    await mockDelay();
    return getLocalRequests();
  },

  createRequest: async (requestData: Partial<UnlockRequest>): Promise<UnlockRequest> => {
    await mockDelay();
    const requests = getLocalRequests();
    const newRequest: UnlockRequest = {
      ...requestData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      status: RequestStatus.REQUESTED
    } as UnlockRequest;
    
    requests.unshift(newRequest);
    saveLocalRequests(requests);
    return newRequest;
  },

  fulfillRequest: async (id: string, formData: FormData): Promise<UnlockRequest> => {
    await mockDelay();
    const requests = getLocalRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    // Simulate file upload by creating a local object URL or using the external link
    const file = formData.get('file') as File;
    const externalLink = formData.get('externalLink') as string;
    
    // NOTE: In a serverless/local-storage app, object URLs from Files are temporary 
    // and revoked on browser refresh. For this demo, we rely mostly on external links.
    // If a file is uploaded, we create a temporary URL.
    const mockUrl = externalLink || (file ? URL.createObjectURL(file) : '#');

    requests[index] = {
      ...requests[index],
      status: RequestStatus.PAYMENT_REQUIRED,
      unlockedUrl: mockUrl
    };
    saveLocalRequests(requests);
    return requests[index];
  },

  confirmPayment: async (id: string, unlockType: UnlockType): Promise<UnlockRequest> => {
    await mockDelay();
    const requests = getLocalRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    requests[index] = {
      ...requests[index],
      status: RequestStatus.READY,
      unlockType: unlockType
    };
    saveLocalRequests(requests);
    return requests[index];
  },

  cancelRequest: async (id: string): Promise<UnlockRequest> => {
    await mockDelay();
    const requests = getLocalRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    requests[index] = {
      ...requests[index],
      status: RequestStatus.FAILED
    };
    saveLocalRequests(requests);
    return requests[index];
  }
};
