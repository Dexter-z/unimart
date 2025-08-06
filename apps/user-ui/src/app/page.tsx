
import React from 'react'
import HeroSection from '@/components/hero-section';
import SuggestedProductsSection from '@/components/suggested-products-section';
import LatestProductsSection from '@/components/latest-products-section';
import TopShopsSection from '@/components/top-shops-section';

const Page = () => {
  return (
    <>
      <HeroSection />
      <SuggestedProductsSection />
      <LatestProductsSection />
      <TopShopsSection />
      <div className='h-[200vh]'>
        {/* ...rest of the homepage... */}
      </div>
    </>
  )
}

export default Page;
