"use client";

import CartItems from "@/components/cart-items";

const CartPage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-[#18181b] min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8">
          Shopping Cart
        </h1>
        <CartItems />
      </div>
    </div>
  );
};

export default CartPage;
