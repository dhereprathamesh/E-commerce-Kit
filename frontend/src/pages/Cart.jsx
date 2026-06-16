export default function Cart() {
  const cart = [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold">Your Cart</h1>

      <div className="mt-6 space-y-3">
        {cart.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="border p-3 rounded">
              <div>{item.name}</div>
              <div>Qty: {item.qty}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
