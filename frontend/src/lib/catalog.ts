export type CatalogItem = {
  id: string;
  category: string;
  name: string;
  qty?: string;
  priceCents: number;
  priceDisplay?: string;
  desc?: string;
  image?: string;
};

export const catalog: CatalogItem[] = [
  { id: '1', category: 'Signature Puddings', name: 'Classic Banana Pudding', qty: '8 oz', priceCents: 1000, priceDisplay: '$10.00', desc: 'The golden crumb of our signature shortbread meets a velvety vanilla cloud.' },
  { id: '2', category: 'Signature Puddings', name: 'Strawberry Banana Pudding', qty: '8 oz', priceCents: 1200, priceDisplay: '$12.00', desc: 'Fresh strawberries folded into our decadent banana and vanilla creation.' },
  { id: '3', category: 'Signature Puddings', name: 'Cookie Butter Banana Pudding', qty: '8 oz', priceCents: 1200, priceDisplay: '$12.00', desc: 'A rich infusion of spiced cookie butter swirled through velvety layers.' },
  { id: '4', category: 'Artisan Cakes', name: 'Brown Butter Pound Cake', qty: '1 slice', priceCents: 800, priceDisplay: '$8.00', desc: 'A rich, buttery slice of Southern comfort with a delicate, caramelized crust.' },
  { id: '5', category: 'Southern Pies', name: 'Sweet Potato Pie', qty: '1 pie', priceCents: 3000, priceDisplay: '$30.00', desc: 'Silky, spiced sweet potato filling nestled in a flaky, handcrafted butter crust.' },
  { id: '6', category: 'Southern Pies', name: 'Sweet Potato Tarts', qty: '4 pack', priceCents: 1000, priceDisplay: '$10.00', desc: 'Bite-sized perfection featuring our signature sweet potato filling.' },
  { id: '7', category: 'Southern Pies', name: 'Pecan Pie (Seasonal)', qty: '1 pie', priceCents: 3500, priceDisplay: '$35.00', desc: 'A royal treat of toasted pecans suspended in a rich, buttery caramel filling.' },
  { id: '8', category: 'Cobblers', name: 'Peach Cobbler', qty: '8 oz', priceCents: 800, priceDisplay: '$8.00', desc: 'Warm, spiced peaches baked under a golden, sugary crust.' },
  { id: '9', category: 'Cookies', name: 'Chocolate Chip Cookies', qty: '1 dozen', priceCents: 2400, priceDisplay: '$24.00', desc: 'Classic, chewy, and loaded with premium chocolate morsels.' },
  { id: '10', category: 'Cookies', name: 'Assorted Cookies', qty: '6 cookies', priceCents: 1200, priceDisplay: '$12.00', desc: 'A curated selection of our finest cookie offerings.' },
  { id: '11', category: 'Cookies', name: 'Standard Single Cookie', qty: '1 cookie', priceCents: 325, priceDisplay: '$3.25', desc: 'A single, perfectly baked masterpiece.' },
  { id: '12', category: 'Cookies', name: 'Cookie Butter Cookie', qty: '1 cookie', priceCents: 400, priceDisplay: '$4.00', desc: 'A soft, spiced cookie exploding with cookie butter flavor.' },
  { id: '13', category: 'Cookies', name: 'Oreo Crumb Cookie', qty: '1 cookie', priceCents: 499, priceDisplay: '$4.99', desc: 'Rich chocolate and vanilla cream flavors baked into every bite.' },
  { id: '14', category: 'Cookies', name: 'Smores Cookie (Seasonal)', qty: '1 cookie', priceCents: 400, priceDisplay: '$4.00', desc: 'Graham, chocolate, and toasted marshmallow wrapped in a cookie.' },
];

export function getPriceCents(itemId: string): number | null {
  const it = catalog.find(i => i.id === itemId);
  return it ? it.priceCents : null;
}

export function computeSubtotalCents(items: { id: string; quantity: number }[]): number {
  let total = 0;
  for (const it of items) {
    const price = getPriceCents(it.id);
    if (price === null) throw new Error(`Unknown item id: ${it.id}`);
    total += price * it.quantity;
  }
  return total;
}
