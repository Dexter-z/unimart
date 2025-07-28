"use client";

import CartItems from "@/components/cart-items";

const CartPage = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#18181b] h-[100vh] text-white">
      <h1 className="text-3xl font-extrabold text-white mb-8">
        Shopping Cart
      </h1>
      <CartItems />
    </div>
  );
};

export default CartPage;
