
import React from 'react'
import HeroSection from '@/components/hero-section';
import SuggestedProductsSection from '@/components/suggested-products-section';
import LatestProductsSection from '@/components/latest-products-section';

const Page = () => {
  return (
    <>
      <HeroSection />
      <SuggestedProductsSection />
      <LatestProductsSection />
      <div className='h-[200vh]'>
        {/* ...rest of the homepage... */}
      </div>
    </>
  )
}

export default Page;
