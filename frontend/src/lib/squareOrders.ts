import { randomUUID } from 'crypto';
import { DateTime } from 'luxon';
import { getSquareClient, getSquareLocationId } from './square';
import { catalog } from './catalog';
import { PICKUP_WINDOWS, TIME_ZONE, type PickupDay } from './pickup';

export interface CartLine {
  id: string;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export async function upsertCustomer({ name, email, phone }: CustomerInfo): Promise<string> {
  const client = getSquareClient();
  const searchResult = await client.customers.search({
    query: { filter: { emailAddress: { exact: email } } },
  });
  const existing = searchResult.customers?.[0];
  if (existing?.id) return existing.id;

  const [givenName, ...rest] = name.trim().split(/\s+/);
  const familyName = rest.join(' ') || undefined;

  const createResult = await client.customers.create({
    idempotencyKey: randomUUID(),
    givenName,
    familyName,
    emailAddress: email,
    phoneNumber: phone,
  });
  if (!createResult.customer?.id) throw new Error('Square did not return a customer id');
  return createResult.customer.id;
}

export function buildLineItems(items: CartLine[]) {
  return items.map((item) => {
    const catalogItem = catalog.find((c) => c.id === item.id);
    if (!catalogItem) throw new Error(`Unknown item id: ${item.id}`);
    return {
      name: catalogItem.name,
      quantity: String(item.quantity),
      basePriceMoney: { amount: BigInt(catalogItem.priceCents), currency: 'USD' as const },
    };
  });
}

export async function createPickupOrder({
  customerId,
  items,
  pickupDateISO,
  pickupDay,
  customerName,
  customerEmail,
  customerPhone,
}: {
  customerId: string;
  items: CartLine[];
  pickupDateISO: string;
  pickupDay: PickupDay;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const client = getSquareClient();
  const locationId = getSquareLocationId();
  const lineItems = buildLineItems(items);

  // Real pickup hours are still TBD (see src/lib/pickup.ts); 5 PM is a
  // placeholder so Square has a valid timestamp. The human-readable window
  // text lives in the fulfillment note below.
  const pickupAt = DateTime.fromISO(pickupDateISO, { zone: TIME_ZONE })
    .set({ hour: 17, minute: 0, second: 0, millisecond: 0 })
    .toISO();

  const result = await client.orders.create({
    idempotencyKey: randomUUID(),
    order: {
      locationId,
      customerId,
      state: 'OPEN',
      lineItems,
      fulfillments: [
        {
          type: 'PICKUP',
          pickupDetails: {
            recipient: {
              customerId,
              displayName: customerName,
              emailAddress: customerEmail,
              phoneNumber: customerPhone,
            },
            pickupAt: pickupAt ?? undefined,
            note: `Pickup window (${pickupDay}): ${PICKUP_WINDOWS[pickupDay]}`,
          },
        },
      ],
    },
  });

  if (!result.order?.id) throw new Error('Square did not return an order id');
  return result.order;
}

export async function chargeOrder({
  orderId,
  sourceId,
  amountCents,
  buyerEmail,
  autocomplete = true,
}: {
  orderId: string;
  sourceId: string;
  amountCents: number;
  buyerEmail?: string;
  autocomplete?: boolean;
}) {
  const client = getSquareClient();
  const locationId = getSquareLocationId();
  const result = await client.payments.create({
    idempotencyKey: randomUUID(),
    sourceId,
    orderId,
    locationId,
    amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
    buyerEmailAddress: buyerEmail,
    autocomplete,
  });
  if (!result.payment) throw new Error('Square did not return a payment');
  return result.payment;
}
