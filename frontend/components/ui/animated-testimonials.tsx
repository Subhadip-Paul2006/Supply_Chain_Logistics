'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Quote, Star } from '@/components/ui/phosphor-icons'
import { motion, useAnimation, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { SplitTypewriter } from '@/components/ui/split-typewriter'

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
}

export interface AnimatedTestimonialsProps {
  title?: string
  subtitle?: string
  badgeText?: string
  testimonials?: Testimonial[]
  autoRotateInterval?: number
  trustedCompanies?: string[]
  trustedCompaniesTitle?: string
  className?: string
  /** When true, strips outer section chrome for embedding inside ScrollGlobe. */
  embedded?: boolean
}

export function AnimatedTestimonials({
  title = 'Loved by operations teams',
  subtitle =
    "Do not take our word for it — see what logistics and compliance leaders say about live visibility with R3FLEX.",
  badgeText = 'Trusted in production',
  testimonials = [],
  autoRotateInterval = 6000,
  trustedCompanies = [],
  trustedCompaniesTitle = 'Trusted by teams worldwide',
  className,
  embedded = false,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const controls = useAnimation()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  }

  useEffect(() => {
    if (isInView) {
      void controls.start('visible')
    }
  }, [isInView, controls])

  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [autoRotateInterval, testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  const shellClass = embedded
    ? 'w-full overflow-hidden py-0'
    : 'py-24 overflow-hidden bg-muted/30'

  return (
    <div
      ref={sectionRef}
      id={embedded ? undefined : 'testimonials'}
      className={cn(shellClass, className)}
    >
      <div className={cn(!embedded && 'px-4 md:px-6')}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid w-full grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:gap-20"
        >
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <div className="space-y-6">
              {badgeText ? (
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Star className="mr-1 h-3.5 w-3.5 fill-primary" aria-hidden />
                  <span>{badgeText}</span>
                </div>
              ) : null}

              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                <SplitTypewriter line1={title} line1ClassName="text-foreground" />
              </h2>

              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                {subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-300',
                      activeIndex === index
                        ? 'w-10 bg-primary'
                        : 'w-2.5 bg-muted-foreground/30',
                    )}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative mr-0 min-h-[280px] md:mr-6 md:min-h-[360px] lg:min-h-[400px]"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 80 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 80,
                  scale: activeIndex === index ? 1 : 0.94,
                }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                style={{ zIndex: activeIndex === index ? 10 : 0 }}
              >
                <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
                  <div className="mb-5 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                    ))}
                  </div>

                  <div className="relative mb-6 flex-1">
                    <Quote
                      className="absolute -top-2 -left-2 h-8 w-8 rotate-180 text-primary/25"
                      aria-hidden
                    />
                    <p className="relative z-10 text-lg font-medium leading-relaxed text-foreground">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={testimonial.avatar} alt="" />
                      <AvatarFallback className="bg-muted text-sm">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-xl bg-primary/5" />
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-xl bg-primary/5" />
          </motion.div>
        </motion.div>

        {trustedCompanies.length > 0 ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={controls}
            className="mt-16 text-center md:mt-24"
          >
            <h3 className="mb-8 text-sm font-medium text-muted-foreground">
              {trustedCompaniesTitle}
            </h3>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 md:gap-x-12">
              {trustedCompanies.map((company) => (
                <div
                  key={company}
                  className="text-xl font-semibold text-muted-foreground/60 md:text-2xl"
                >
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}

export const defaultSupplyChainTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'VP Operations',
    company: 'TransOcean Logistics',
    content:
      'R3FLEX cut our exception response time by half. The single timeline across carriers and customs finally matches how our team actually works.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    name: 'Sarah Miller',
    role: 'Head of Trade Compliance',
    company: 'Northwind Imports',
    content:
      'We rolled out in three regions without another spreadsheet war. Auditors love the signal lineage; ops loves the alerts that are not noise.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Director of Supply Chain',
    company: 'Brightline Manufacturing',
    content:
      'Finally a pane of glass that is not a science project. SSO, encryption, and ERP hooks were straightforward — we went live in under a month.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  },
]
