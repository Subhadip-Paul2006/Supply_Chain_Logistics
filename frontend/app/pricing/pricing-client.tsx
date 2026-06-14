'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import {
  PricingComponent,
  globalTrackerPricingPlans,
  type BillingCycle,
} from '@/components/ui/pricing-card'

export function PricingClient() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('monthly')

  return (
    <PricingComponent
      omitHeader
      plans={globalTrackerPricingPlans}
      billingCycle={billingCycle}
      onCycleChange={setBillingCycle}
      onPlanSelect={(planId) => {
        // SECURITY (M-4 fix): the planId is part of the URL and is echoed
        // back from the server on /signup. We whitelist against the known
        // billing plans here and reject anything unexpected before it ever
        // reaches `router.push`. Without this, a deep link to
        // `/pricing?plan=<arbitrary>` could be redirected into an open
        // redirect or surface a billing plan id the server does not know.
        const ALLOWED_PLANS = new Set([
          'starter',
          'growth',
          'pro',
          'enterprise',
          'free',
          'demo',
        ])
        if (typeof planId !== 'string' || !ALLOWED_PLANS.has(planId)) {
          // Fail closed — never navigate to a plan id we did not enumerate.
          return
        }
        if (planId === 'enterprise') {
          router.push('#')
          return
        }
        router.push(`/signup?plan=${encodeURIComponent(planId)}`)
      }}
    />
  )
}
