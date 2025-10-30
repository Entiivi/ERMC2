// File: src/components/ImageTextCard.tsx
import React from 'react'
import Image from 'next/image'

interface ImageTextCardProps {
    imageSrc: string
    imageAlt: string
    children: React.ReactNode
    className?: string
    imageAspectRatioClass?: string
}

/**
 * A card with an image on the left and text on the right.
 */
export default function ImageTextCard({
    imageSrc,
    imageAlt,
    children,
    className = '',
    imageAspectRatioClass = 'aspect-square',
}: ImageTextCardProps) {
    return (
        <div
            className={`flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-md ${className}`}
        >
            {/* Image container: keeps a fixed aspect ratio (square by default) */}
            <div className={`relative w-full md:w-1/2 ${imageAspectRatioClass}`}>
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    priority
                />
            </div>

            {/* Text area */}
            <div className="w-full md:w-1/2 p-6 flex items-center">
                <div className="prose prose-lg text-gray-800">
                    {children}
                </div>
            </div>
        </div>
    )
}
