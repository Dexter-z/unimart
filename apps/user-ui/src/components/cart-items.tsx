"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
    stock: number;
    discount?: {
      code: string;
      discountType: "percentage" | "amount";
      discountValue: number;
    };
  };
  quantity: number;
  color: string;
  size: string;
}

interface CartItemsProps {
  cartItems: CartItem[];
}

const CartItems: React.FC<CartItemsProps> = ({ cartItems: initialCartItems }) => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [discountCode, setDiscountCode] = useState("");

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && newQuantity > 0 && newQuantity <= item.product.stock) {
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const calculateDiscountedPrice = (item: CartItem) => {
    const { product, quantity } = item;
    const { price, discount } = product;

    if (discount && discount.code === discountCode) {
      if (discount.discountType === "percentage") {
        return (price * (1 - discount.discountValue / 100)) * quantity;
      } else if (discount.discountType === "amount") {
        return (price - discount.discountValue) * quantity;
      }
    }
    return price * quantity;
  };

  const handleCheckout = () => {
    console.log("Checkout clicked", cartItems);
  };

  if (cartItems.length === 0) {
    return <p>Your cart is empty, Start adding products</p>;
  }

  return (
    <div className="w-full">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col md:flex-row items-center justify-between p-4 mb-4 border rounded-lg"
        >
          <div className="flex items-center mb-4 md:mb-0">
            <Image
              src={item.product.images[0].url}
              alt={item.product.name}
              width={100}
              height={100}
              className="rounded-md"
            />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">{item.product.name}</h3>
              <p className="text-sm text-gray-500">
                Color: {item.color} | Size: {item.size}
              </p>
              <p className="text-lg font-bold">
                ${calculateDiscountedPrice(item).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
            >
              -
            </Button>
            <span className="mx-4">{item.quantity}</span>
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
            >
              +
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="ml-4">
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove
                    the item from your cart.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Input
            type="text"
            placeholder="Discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="mr-2"
          />
          <Button>Apply</Button>
        </div>
        <Button size="lg" onClick={handleCheckout}>
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartItems;
