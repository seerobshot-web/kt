import { SquareClient, SquareEnvironment } from 'square';

let cachedClient: SquareClient | null = null;

export function getSquareClient(): SquareClient {
  if (cachedClient) return cachedClient;
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) throw new Error('SQUARE_ACCESS_TOKEN is not configured');
  const environment = process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox;
  cachedClient = new SquareClient({ token: accessToken, environment });
  return cachedClient;
}

export function getSquareLocationId(): string {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error('SQUARE_LOCATION_ID is not configured');
  return locationId;
}

export function isSquareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}
