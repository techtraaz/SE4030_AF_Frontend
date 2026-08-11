import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TestimonialCarousel({ testimonials }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Testimonial Content */}
      <div className="bg-white rounded-3xl p-12 shadow-sm">
        {/* Quote */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl text-brand-navy leading-relaxed font-light">
            "{currentTestimonial.quote}"
          </p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-4">
          <img
            src={currentTestimonial.avatar.url}
            alt={currentTestimonial.avatar.alt}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h4 className="font-bold text-brand-navy mb-1">
              {currentTestimonial.author}
            </h4>
            <p className="text-sm text-brand-blue font-semibold tracking-wide">
              {currentTestimonial.role}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex gap-1 mt-6">
          {[...Array(currentTestimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="w-12 h-12 rounded-full border-2 border-brand-mist hover:border-brand-blue hover:bg-brand-blue hover:text-white transition-all"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-brand-blue w-8'
                  : 'bg-brand-mist hover:bg-brand-blue-light'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="w-12 h-12 rounded-full border-2 border-brand-mist hover:border-brand-blue hover:bg-brand-blue hover:text-white transition-all"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}