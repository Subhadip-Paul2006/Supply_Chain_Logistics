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
        if (planId === 'enterprise') {
          router.push('#')
          return
        }
        router.push(`/signup?plan=${encodeURIComponent(planId)}`)
      }}
    />
  )
}
