const { randomUUID } = require('crypto');

function crearOrden() {
  const items = [
    {
      sku: 'PROD-102',
      name: 'Teclado Mecánico',
      price: 45.0,
      qty: 1,
    },
    {
      sku: 'PROD-504',
      name: 'Mouse Inalámbrico',
      price: 25.5,
      qty: 2,
    },
  ];

  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  return {
    order_id: `ORD-${new Date().getFullYear()}-${randomUUID()
      .slice(0, 8)
      .toUpperCase()}`,
    customer_name: 'Carlos Mendoza',
    customer_email: 'carlos.mendoza@example.com',
    purchase_date: new Date().toISOString(),
    items,
    total_amount: totalAmount,
  };
}

module.exports = {
  crearOrden,
};