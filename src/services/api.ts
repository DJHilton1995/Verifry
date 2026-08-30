export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface HandshakeRequest {
  clientPublicKey: string; // Base64 encoded Kyber-768 public key
}

export interface HandshakeResponse {
  sessionId: string;
  serverCiphertext: string; // Base64 encoded encapsulated secret
}

export interface ScanRequest {
  sessionId: string;
  targetUrl: string;
}

export interface ScanResponse {
  status: 'scanning' | 'failed';
  jobId?: string;
  message?: string;
}

export interface ScanStatusResponse {
  status: 'scanning' | 'complete' | 'failed';
  progress: number;
  logs: Array<{
    id: string;
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
    module: 'SYSTEM' | 'KYBER' | 'SCANNER' | 'DPI' | 'IPS' | 'WARDEN';
  }>;
  results?: {
    vulnerabilities: number;
    score: number;
    grade: string;
    findings: Array<{
      id: string;
      title: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      remediation: string;
      affectedModule: string;
    }>;
  };
}

/**
 * API Client for connecting the frontend to the Rust (Axum) backend.
 */
export class VerifryerAPI {
  /**
   * Initiates the Kyber post-quantum handshake with the server.
   */
  static async initiateHandshake(clientPubKey: string): Promise<HandshakeResponse> {
    const response = await fetch(`${API_BASE_URL}/handshake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientPublicKey: clientPubKey }),
    });

    if (!response.ok) {
      throw new Error(`Handshake failed: HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Starts the application scan using the established session.
   */
  static async startScan(sessionId: string, targetUrl: string): Promise<ScanResponse> {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, targetUrl }),
    });

    if (!response.ok) {
      throw new Error(`Scan initiation failed: HTTP ${response.status}`);
    }

    return response.json();
  }
  
  /**
   * Polls the server for the status of an ongoing scan.
   */
  static async getScanStatus(jobId: string): Promise<ScanStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/scan/${jobId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch scan status: HTTP ${response.status}`);
    }

    return response.json();
  }
}
