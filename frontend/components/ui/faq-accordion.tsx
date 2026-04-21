'use client'

import * as React from 'react'
import { HelpCircle, MessageCircle, ChevronDown } from '@/components/ui/phosphor-icons'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

import { cn } from '@/lib/utils'
import { SplitTypewriter } from '@/components/ui/split-typewriter'

const CustomAccordion = AccordionPrimitive.Root

const CustomAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('', className)} {...props} />
))
CustomAccordionItem.displayName = 'CustomAccordionItem'

const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between gap-4 rounded-2xl p-4 text-left',
        'border border-border bg-card/80 text-foreground shadow-sm transition-all',
        'hover:bg-muted/40 hover:shadow-md',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        'data-[state=open]:border-primary/30 data-[state=open]:bg-card data-[state=open]:shadow-md',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <HelpCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span className="text-lg font-medium tracking-wide text-foreground">
          {children}
        </span>
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-105 group-data-[state=open]:rotate-180">
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
CustomAccordionTrigger.displayName = 'CustomAccordionTrigger'

const CustomAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-foreground',
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down pb-2',
      className,
    )}
    {...props}
  >
    <div className="mt-4 ml-2 sm:ml-14">
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-popover/90 p-4 shadow-md transition-all">
        <span className="flex-1 text-base leading-relaxed text-muted-foreground">
          {children}
        </span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 transition-transform hover:scale-105">
          <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
        </div>
      </div>
    </div>
  </AccordionPrimitive.Content>
))
CustomAccordionContent.displayName = 'CustomAccordionContent'

export {
  CustomAccordion,
  CustomAccordionItem,
  CustomAccordionTrigger,
  CustomAccordionContent,
}

export type FaqItem = { question: string; answer: string }

const defaultFaqs: FaqItem[] = [
  {
    question: 'How does R3FLEX ingest supply-chain signals?',
    answer:
      'We connect to carriers, ports, customs feeds, and your internal systems via secure APIs and streaming adapters. Events are normalized into a single timeline with full lineage so you can audit every signal.',
  },
  {
    question: 'Is my operational data encrypted and compliant?',
    answer:
      'Yes. Data is encrypted in transit and at rest, with SOC 2 Type II controls and regional deployment options. You control retention and can export or delete on request.',
  },
  {
    question: 'Can R3FLEX integrate with our TMS or ERP?',
    answer:
      'We ship connectors for major TMS, ERP, and visibility platforms, plus a webhook and GraphQL API for custom stacks. Our solutions team helps scope integrations during onboarding.',
  },
  {
    question: 'What does onboarding look like for a new region?',
    answer:
      'Typical rollout is staged: connect data sources, map facilities and lanes, tune detection rules, then train your team. Most teams see value in the first two weeks.',
  },
  {
    question: 'How is pricing structured?',
    answer:
      'Pricing scales with monitored lanes, event volume, and seats. Start with a 14-day trial; we will size a plan after a short discovery call.',
  },
]

export interface FaqAccordionSectionProps {
  className?: string
  headingClassName?: string
  title?: string
  faqs?: FaqItem[]
}

export function FaqAccordionSection({
  className,
  headingClassName,
  title = 'Frequently asked questions',
  faqs = defaultFaqs,
}: FaqAccordionSectionProps) {
  return (
    <div className={cn('w-full', className)}>
      <h2
        className={cn(
          'mb-8 text-center text-2xl font-bold text-foreground md:text-3xl',
          headingClassName,
        )}
      >
        <SplitTypewriter line1={title} line1ClassName="text-foreground" />
      </h2>
      <CustomAccordion
        type="single"
        collapsible
        defaultValue="item-0"
        className="space-y-4 sm:space-y-6"
      >
        {faqs.map((faq, index) => (
          <CustomAccordionItem key={faq.question} value={`item-${index}`}>
            <CustomAccordionTrigger>{faq.question}</CustomAccordionTrigger>
            <CustomAccordionContent>{faq.answer}</CustomAccordionContent>
          </CustomAccordionItem>
        ))}
      </CustomAccordion>
    </div>
  )
}

/** Alias for the integration prompt (`AccordionComponent`). */
export const AccordionComponent = FaqAccordionSection
