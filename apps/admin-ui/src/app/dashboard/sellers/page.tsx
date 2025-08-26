import React from "react";
import SellersTable from "./SellersTable";

export default function SellersPage() {
  return (
    <div className="p-4 sm:p-6 bg-black min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Seller Management</h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage and track all sellers</p>
      </div>
      <SellersTable />
    </div>
  );
}
