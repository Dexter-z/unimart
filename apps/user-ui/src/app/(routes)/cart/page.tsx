"use client";

import CartItems from "@/components/cart-items";

const initialCartItems = [
  {
    id: "1",
    product: {
      id: "prod1",
      name: "Wireless Headphones",
      price: 99.99,
      images: [{ url: "https://via.placeholder.com/150" }],
      stock: 10,
      discount: {
        code: "SUMMER20",
        discountType: "percentage" as "percentage" | "amount",
        discountValue: 20,
      },
    },
    quantity: 1,
    color: "Black",
    size: "One Size",
  },
  {
    id: "2",
    product: {
      id: "prod2",
      name: "Smartwatch",
      price: 199.99,
      images: [{ url: "https://via.placeholder.com/150" }],
      stock: 5,
    },
    quantity: 1,
    color: "Silver",
    size: "44mm",
  },
];

const CartPage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Shopping Cart
      </h1>
      <CartItems cartItems={initialCartItems} />
    </div>
  );
};

export default CartPage;
