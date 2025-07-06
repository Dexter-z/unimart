'use client'
import ImagePlaceHolder from '@/components/image-placeholder';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

const page = () => {
    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [openImageModal, setOpenImageModal] = useState(false)
    const [isChanged, setIschanged] = useState(false)
    const [images, setImages] = useState<(File | null)[]>([null])
    const [loading, setIsLoading] = useState(false)

    const onSubmit = (data: any) => {
        console.log(data)
    }

    const handleImageChange = (file: File | null, index: number) => {
        const updatedImages = [...images];
        updatedImages[index] = file;

        if (index === images.length - 1 && images.length < 8) {
            updatedImages.push(null)
        }

        setImages(updatedImages)
        setValue('images', updatedImages)
    }

    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages]

            if (index === -1) {
                updatedImages[0] = null
            } else {
                updatedImages.splice(index, 1)
            }

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null)
            }

            return updatedImages
        })

        setValue("images", images)
    }

    return (
        <form
            className='w-full mx-auto p-8 shadow-md rounded-lg text-white'
            onSubmit={handleSubmit(onSubmit)}
        >
            <h2 className='text-2xl py-2 font-semibold font-Poppins text-white'>
                Create Product
            </h2>

            <div className='flex items-center'>
                <span className='text-[#80Deea] cursor-pointer'>Dashboard</span>
                <ChevronRight size={20} className='opacity-[.8]' />
                <span>Create Product</span>
            </div>

            {/* Content Layout */}
            <div className='py-4 w-full flex gap-6'>
                {/* Left side; Image upload */}
                <div className='md:w-[35%]'>
                    {images?.length > 0 && (
                        <ImagePlaceHolder
                            setOpenImageModal={setOpenImageModal}
                            size='765 X 850'
                            small={false}
                            index={0}
                            onImageChange={handleImageChange}
                        />
                    )}
                </div>

                <div className='grid grid-cols-2 gap-3 mt-4'>
                    {images.slice(1).map((_, index) => (
                        <ImagePlaceHolder
                            setOpenImageModal={setOpenImageModal}
                            size='765 X 850'
                            key={index}
                            small={true}
                            index={index + 1}
                            onImageChange={handleImageChange}
                        />
                    ))}
                </div>

                {/* Middle and Right side for rest of form input */}
                <div className='w-65%'>
                    <div className='mt-6 flex justify-end gap-3'>

                    </div>
                </div>

            </div>

        </form>
    )
}

export default page
