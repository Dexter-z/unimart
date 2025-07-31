"use client";

import CartItems from "@/components/cart-items";

const CartPage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-[#18181b] min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-400 text-sm">
            Review your items and proceed to checkout
          </p>
        </div>
        
        <CartItems />
      </div>
    </div>
  );
};

export default CartPage;
