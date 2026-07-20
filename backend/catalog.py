CATALOG = {
    '1': {'name': 'Classic Banana Pudding', 'price_cents': 1000},
    '2': {'name': 'Strawberry Banana Pudding', 'price_cents': 1200},
    '3': {'name': 'Cookie Butter Banana Pudding', 'price_cents': 1200},
    '4': {'name': 'Brown Butter Pound Cake', 'price_cents': 800},
    '5': {'name': 'Sweet Potato Pie', 'price_cents': 3000},
    '6': {'name': 'Sweet Potato Tarts', 'price_cents': 1000},
    '7': {'name': 'Pecan Pie (Seasonal)', 'price_cents': 3500},
    '8': {'name': 'Peach Cobbler', 'price_cents': 800},
    '9': {'name': 'Chocolate Chip Cookies', 'price_cents': 2400},
    '10': {'name': 'Assorted Cookies', 'price_cents': 1200},
    '11': {'name': 'Standard Single Cookie', 'price_cents': 325},
    '12': {'name': 'Cookie Butter Cookie', 'price_cents': 400},
    '13': {'name': 'Oreo Crumb Cookie', 'price_cents': 499},
    '14': {'name': 'Smores Cookie (Seasonal)', 'price_cents': 400},
}


def compute_subtotal_cents(items):
    total = 0
    for it in items:
        entry = CATALOG.get(it['id'])
        if entry is None:
            raise ValueError(f"Unknown item id: {it['id']}")
        total += entry['price_cents'] * it['quantity']
    return total
