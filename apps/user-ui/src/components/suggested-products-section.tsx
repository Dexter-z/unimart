import React from 'react';

const dummyProducts = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

const SuggestedProductsSection = () => {
  return (
    <section className="w-full py-8 md:py-12 bg-[#18181b]">
      <div className="w-[95%] md:w-[80%] mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-[#ff8800] mb-4">Suggested Products</h2>
        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible pb-2">
          {dummyProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-[160px] md:min-w-0 bg-[#232326] rounded-xl p-4 flex flex-col items-center animate-pulse border border-[#232326] shadow-sm"
            >
              <div className="w-24 h-24 bg-gray-700 rounded-lg mb-3" />
              <div className="h-4 w-20 bg-gray-700 rounded mb-2" />
              <div className="h-3 w-12 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestedProductsSection; 