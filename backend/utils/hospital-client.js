/**
 * Hospital API Client to fetch details about a specific hospital.
 */
export class HospitalClient {
  constructor() {
    this.baseUrl = process.env.HOSPITAL_API_URL || '';
    this.token = process.env.HOSPITAL_API_TOKEN || '';
    this.cache = new Map();
  }

  /**
   * Fetches hospital details by ID. 
   * Includes simple caching to prevent redundant API calls for the same hospital.
   */
  async getHospitalById(hospitalId) {
    if (!hospitalId) return null;

    // Return from cache if available
    if (this.cache.has(hospitalId)) {
      console.log(`Returning cached data for hospital: ${hospitalId}`);
      return this.cache.get(hospitalId);
    }

    try {
      console.log(`Calling Hospital Service API for ID: ${hospitalId}`);
      
      const response = await fetch(`${this.baseUrl}/v1/hospitals/${hospitalId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
          'X-Trace-Id': `trace-${Date.now()}`
        },
        // Timeout handling (5 seconds)
        signal: AbortSignal.timeout(5000)
      });

      if (response.status === 404) {
        console.warn(`Hospital not found: ${hospitalId}`);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Hospital API returned status: ${response.status}`);
      }

      const body = await response.json();
      const hospitalData = body.data;

      // Save to cache
      this.cache.set(hospitalId, hospitalData);
      
      return hospitalData;

    } catch (error) {
      console.error(`Failed to fetch hospital details for ${hospitalId}:`, error.message);
      // In a production environment, you might want to implement a retry logic here
      // for transient network errors (e.g. 5xx or timeout)
      return null;
    }
  }
}

// Singleton instance for the service
export const hospitalClient = new HospitalClient();
