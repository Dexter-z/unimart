"use client"


import React, { Suspense, useEffect } from 'react';
import { CheckCircle, Truck } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store';
import confetti from 'canvas-confetti';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    useStore.setState({ cart: [] });
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#18181b] to-[#0f0f0f] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-green-400/30 animate-ping"></div>
            <div className="absolute inset-0 w-32 h-32 -m-4 rounded-full border-2 border-green-400/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Payment Successful! 🎉</h1>
          <p className="text-xl text-gray-300 mb-2">Thank you for your purchase!</p>
          <p className="text-gray-400">Your order has been confirmed and is being processed.</p>
        </div>
        {/* Order Status Card */}
        <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl p-6 sm:p-8 border border-[#232326] shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#ff8800]/10 rounded-xl border border-[#ff8800]/20">
              <Truck className="w-6 h-6 text-[#ff8800]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Order Status</h2>
              <p className="text-gray-400">Your order is being prepared for shipment</p>
            </div>
          </div>
          {sessionId && (
            <div className="bg-[#18181b] rounded-xl p-4 border border-[#232326] mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Order ID</p>
                  <p className="text-white font-mono text-lg">{sessionId}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(sessionId)}
                  className="px-4 py-2 bg-[#ff8800]/10 border border-[#ff8800]/20 text-[#ff8800] rounded-lg hover:bg-[#ff8800]/20 transition-colors duration-200 text-sm"
                >
                  Copy ID
                </button>
              </div>
            </div>
          )}
          {/* Order Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Payment Confirmed</p>
                <p className="text-gray-400 text-sm">Just now</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#ff8800] rounded-full flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Order Processing</p>
                <p className="text-gray-400 text-sm">In progress</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 font-medium">Shipped</p>
                <p className="text-gray-500 text-sm">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 font-medium">Delivered</p>
                <p className="text-gray-500 text-sm">Pending</p>
              </div>
            </div>
          </div>
        </div>
        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Details */}
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl p-6 border border-[#232326] hover:border-[#ff8800]/50 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Order Details</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">View your complete order information and receipt</p>
            <button
              onClick={() => router.push('/profile?tab=orders')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              View Order
            </button>
          </div>
          {/* Continue Shopping */}
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl p-6 border border-[#232326] hover:border-[#ff8800]/50 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#ff8800]/10 rounded-lg">
                <svg className="w-5 h-5 text-[#ff8800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Continue Shopping</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Discover more amazing products in our store</p>
            <button
              onClick={() => router.push('/products')}
              className="w-full bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff4400] text-[#18181b] py-2 rounded-lg transition-all duration-200 text-sm font-bold"
            >
              Shop More
            </button>
          </div>
          {/* Support */}
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl p-6 border border-[#232326] hover:border-[#ff8800]/50 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Need Help?</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Contact our support team for any questions</p>
            <button
              onClick={() => router.push('/support')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Get Support
            </button>
          </div>
        </div>
        {/* Thank You Message */}
        <div className="text-center bg-gradient-to-r from-[#ff8800]/5 to-[#ff6600]/5 border border-[#ff8800]/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Thank You for Choosing UniMart! 🛍️</h3>
          <p className="text-gray-300 mb-4">We appreciate your business and trust in our platform. You'll receive email confirmations and tracking information shortly.</p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Secure Payment
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Fast Delivery
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
