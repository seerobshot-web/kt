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
  totalCents,
  depositCents,
}: {
  customerId: string;
  items: CartLine[];
  pickupDateISO: string;
  pickupDay: PickupDay;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalCents: number;
  // Present only for deposit orders — see the accounting note on chargeOrder().
  depositCents?: number;
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
      // Square's Payments API only lets a single CreatePayment call tied to
      // order_id charge the exact order total, and its multi-payment/PayOrder
      // pattern for split tenders relies on card holds that auto-expire after
      // 7 days — too short for a deposit taken weeks before pickup. So for
      // deposit orders we track paid-so-far ourselves in order metadata
      // (still stored on the Square Order, just not via its built-in tender
      // math) instead of relying on netAmountDueMoney.
      metadata:
        depositCents != null
          ? { paymentPlan: 'deposit', totalCents: String(totalCents), balancePaidCents: String(depositCents) }
          : { paymentPlan: 'full', totalCents: String(totalCents), balancePaidCents: String(totalCents) },
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
  attachToOrder = true,
}: {
  orderId: string;
  sourceId: string;
  amountCents: number;
  buyerEmail?: string;
  // Square requires a payment attached to order_id to exactly equal the
  // order total, so only the full-payment path (checkout, or a non-deposit
  // take-payment charge) attaches it. Deposit/balance payments are charged
  // as standalone payments and reconciled via order metadata instead (see
  // createPickupOrder and recordOrderPayment).
  attachToOrder?: boolean;
}) {
  const client = getSquareClient();
  const locationId = getSquareLocationId();
  const result = await client.payments.create({
    idempotencyKey: randomUUID(),
    sourceId,
    orderId: attachToOrder ? orderId : undefined,
    locationId,
    amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
    buyerEmailAddress: buyerEmail,
    note: attachToOrder ? undefined : `Kingdom Treatz order ${orderId}`,
    autocomplete: true,
  });
  if (!result.payment) throw new Error('Square did not return a payment');
  return result.payment;
}

export interface OrderBalance {
  totalCents: number;
  balancePaidCents: number;
  remainingCents: number;
}

export function readOrderBalance(order: { totalMoney?: { amount?: bigint | number | null } | null; metadata?: Record<string, string | null> | null }): OrderBalance {
  const metadata = order.metadata || {};
  const totalCents = metadata.totalCents ? Number(metadata.totalCents) : Number(order.totalMoney?.amount || 0);
  const balancePaidCents = metadata.balancePaidCents ? Number(metadata.balancePaidCents) : totalCents;
  return { totalCents, balancePaidCents, remainingCents: Math.max(0, totalCents - balancePaidCents) };
}

// Records a payment against a deposit order's metadata-based balance and
// marks the order COMPLETED once fully paid.
export async function recordOrderPayment(orderId: string, amountCentsPaid: number) {
  const client = getSquareClient();
  const locationId = getSquareLocationId();
  const current = await client.orders.get({ orderId });
  if (!current.order) throw new Error('Order not found');

  const balance = readOrderBalance(current.order);
  const newBalancePaidCents = balance.balancePaidCents + amountCentsPaid;
  const fullyPaid = newBalancePaidCents >= balance.totalCents;

  const result = await client.orders.update({
    orderId,
    order: {
      locationId,
      version: current.order.version,
      metadata: { ...current.order.metadata, balancePaidCents: String(newBalancePaidCents) },
      state: fullyPaid ? 'COMPLETED' : undefined,
    },
    idempotencyKey: randomUUID(),
  });
  return result.order;
}
