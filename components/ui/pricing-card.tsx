'use client'

import * as React from 'react'
import { Check, X } from 'lucide-react'

import { GlowButton } from '@/components/ui/glow-button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type BillingCycle = 'monthly' | 'annually'

export interface Feature {
  name: string
  isIncluded: boolean
  tooltip?: string
}

export interface PriceTier {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceAnnually: number
  isPopular: boolean
  buttonLabel: string
  features: Feature[]
  /** When set, replaces $ amount (e.g. enterprise “Custom”). */
  customPriceLabel?: string
}

export interface PricingComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  plans: [PriceTier, PriceTier, PriceTier]
  billingCycle: BillingCycle
  onCycleChange: (cycle: BillingCycle) => void
  onPlanSelect: (planId: string, cycle: BillingCycle) => void
  /** Hide built-in title block when the page already has a hero. */
  omitHeader?: boolean
}

function FeatureItem({ feature }: { feature: Feature }) {
  const Icon = feature.isIncluded ? Check : X
  const iconColor = feature.isIncluded ? 'text-primary' : 'text-muted-foreground'

  return (
    <li className="flex items-start space-x-3 py-2">
      <Icon
        className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor)}
        aria-hidden="true"
      />
      <span
        className={cn(
          'text-sm',
          feature.isIncluded ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {feature.name}
      </span>
    </li>
  )
}

export function PricingComponent({
  plans,
  billingCycle,
  onCycleChange,
  onPlanSelect,
  omitHeader = false,
  className,
  ...props
}: PricingComponentProps) {
  if (plans.length !== 3) {
    if (typeof window !== 'undefined') {
      console.error('PricingComponent requires exactly 3 pricing tiers.')
    }
    return null
  }

  const annualDiscountPercent = 20

  const CycleToggle = (
    <div className="mb-10 mt-2 flex justify-center">
      <ToggleGroup
        type="single"
        value={billingCycle}
        onValueChange={(value) => {
          if (value === 'monthly' || value === 'annually') {
            onCycleChange(value)
          }
        }}
        aria-label="Select billing cycle"
        className="rounded-lg border border-border bg-muted/50 p-1"
      >
        <ToggleGroupItem
          value="monthly"
          aria-label="Monthly Billing"
          className="rounded-md px-6 py-1.5 text-sm font-medium data-[state=on]:border data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-ring/20"
        >
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem
          value="annually"
          aria-label="Annual Billing"
          className="relative rounded-md px-6 py-1.5 text-sm font-medium data-[state=on]:border data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-ring/20"
        >
          Annually
          <span className="absolute -top-3 right-0 rounded-full bg-primary/10 px-1.5 text-xs font-semibold whitespace-nowrap text-primary/90">
            Save {annualDiscountPercent}%
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )

  const allFeatures = Array.from(
    new Set(plans.flatMap((p) => p.features.map((f) => f.name))),
  )

  const PricingCards = (
    <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
      {plans.map((plan) => {
        const isFeatured = plan.isPopular
        const currentPrice =
          billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually
        const originalMonthlyPrice = plan.priceMonthly
        const priceSuffix = billingCycle === 'monthly' ? '/mo' : '/yr'
        const showMoney = !plan.customPriceLabel

        return (
          <Card
            key={plan.id}
            className={cn(
              'flex flex-col gap-0 py-0 transition-all duration-300 shadow-md hover:shadow-lg',
              isFeatured &&
                'scale-[1.01] shadow-xl ring-2 ring-primary md:scale-[1.02] md:hover:scale-[1.04]',
            )}
          >
            <CardHeader className="p-6 pb-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                {isFeatured ? (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                ) : null}
              </div>
              <CardDescription className="mt-1 text-sm">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                {showMoney ? (
                  <p className="text-4xl font-extrabold text-foreground">
                    ${currentPrice}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      {priceSuffix}
                    </span>
                  </p>
                ) : (
                  <p className="text-4xl font-extrabold text-foreground">
                    {plan.customPriceLabel}
                  </p>
                )}
                {showMoney &&
                billingCycle === 'annually' &&
                plan.priceMonthly > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Billed annually (${plan.priceAnnually})
                  </p>
                ) : null}
                {showMoney &&
                billingCycle === 'annually' &&
                plan.priceMonthly > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground line-through opacity-70">
                    ${originalMonthlyPrice}/mo
                  </p>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grow p-6 pt-0">
              <h4 className="mt-4 mb-2 text-sm font-semibold text-foreground/80">
                Key features:
              </h4>
              <ul className="list-none space-y-0">
                {plan.features.slice(0, 5).map((feature) => (
                  <FeatureItem key={feature.name} feature={feature} />
                ))}
                {plan.features.length > 5 ? (
                  <li className="mt-2 text-sm text-muted-foreground">
                    + {plan.features.length - 5} more features
                  </li>
                ) : null}
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <GlowButton
                label={plan.buttonLabel}
                type="button"
                onClick={() => onPlanSelect(plan.id, billingCycle)}
                className={cn('w-full h-11', isFeatured && 'shadow-xl shadow-primary/30')}
                variant={isFeatured ? 'primary' : 'secondary'}
                aria-label={`Select ${plan.name} plan`}
              />
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )

  const ComparisonTable = (
    <div className="mt-16 hidden overflow-x-auto rounded-lg border border-border shadow-sm md:block">
      <table className="min-w-full divide-y divide-border/80">
        <thead>
          <tr className="bg-muted/30">
            <th
              scope="col"
              className="w-[200px] px-6 py-4 text-left text-sm font-semibold whitespace-nowrap text-foreground/80"
            >
              Feature
            </th>
            {plans.map((plan) => (
              <th
                key={`th-${plan.id}`}
                scope="col"
                className={cn(
                  'px-6 py-4 text-center text-sm font-semibold whitespace-nowrap text-foreground/80',
                  plan.isPopular && 'bg-primary/10',
                )}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80 bg-background/90">
          {allFeatures.map((featureName, index) => (
            <tr
              key={featureName}
              className={cn(
                'transition-colors hover:bg-accent/20',
                index % 2 === 0 ? 'bg-background' : 'bg-muted/10',
              )}
            >
              <td className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap text-foreground/90">
                {featureName}
              </td>
              {plans.map((plan) => {
                const feature = plan.features.find((f) => f.name === featureName)
                const isIncluded = feature?.isIncluded ?? false
                const Icon = isIncluded ? Check : X
                const iconColor = isIncluded
                  ? 'text-primary'
                  : 'text-muted-foreground/70'

                return (
                  <td
                    key={`${plan.id}-${featureName}`}
                    className={cn(
                      'px-6 py-3 text-center transition-all duration-150',
                      plan.isPopular && 'bg-primary/5',
                    )}
                  >
                    <Icon
                      className={cn('mx-auto h-5 w-5', iconColor)}
                      aria-hidden="true"
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-20 lg:px-8',
        className,
      )}
      {...props}
    >
      {!omitHeader ? (
        <header className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose the right plan for your operation.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Scale from a single detection node to enterprise-wide coverage — with
            pricing that grows with your signal volume.
          </p>
        </header>
      ) : null}

      {CycleToggle}

      <section aria-labelledby="pricing-plans">{PricingCards}</section>

      <section aria-label="Feature comparison" className="mt-16">
        <h3 className="mb-6 hidden text-center text-2xl font-bold text-foreground md:block">
          Detailed feature comparison
        </h3>
        {ComparisonTable}
      </section>
    </div>
  )
}

export const globalTrackerPricingPlans: [PriceTier, PriceTier, PriceTier] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individual operators getting signals off the ground.',
    priceMonthly: 0,
    priceAnnually: 0,
    isPopular: false,
    buttonLabel: 'Start free',
    features: [
      { name: 'Up to 3 detection nodes', isIncluded: true },
      { name: '10,000 events / month', isIncluded: true },
      { name: '7-day event retention', isIncluded: true },
      { name: 'Community support', isIncluded: true },
      { name: 'Basic anomaly alerts', isIncluded: true },
      { name: 'Custom rules engine', isIncluded: false },
      { name: 'SSO / SCIM', isIncluded: false },
      { name: 'Dedicated Solutions Architect', isIncluded: false },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For ops teams who need shared visibility and fast response.',
    priceMonthly: 49,
    priceAnnually: 470,
    isPopular: true,
    buttonLabel: 'Start 14-day trial',
    features: [
      { name: 'Unlimited detection nodes', isIncluded: true },
      { name: '2M events / month included', isIncluded: true },
      { name: '90-day event retention', isIncluded: true },
      { name: 'Role-based access control', isIncluded: true },
      { name: 'Detection Engine + custom rules', isIncluded: true },
      { name: 'Priority email & chat', isIncluded: true },
      { name: 'SSO / SCIM', isIncluded: false },
      { name: '99.99% uptime SLA', isIncluded: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Mission-critical networks with dedicated support and SLAs.',
    priceMonthly: 0,
    priceAnnually: 0,
    customPriceLabel: 'Custom',
    isPopular: false,
    buttonLabel: 'Talk to sales',
    features: [
      { name: 'Unlimited events & retention', isIncluded: true },
      { name: 'Dedicated detection cluster', isIncluded: true },
      { name: 'SOC 2 Type II + compliance options', isIncluded: true },
      { name: 'SSO, SCIM, audit log streaming', isIncluded: true },
      { name: 'Dedicated Solutions Architect', isIncluded: true },
      { name: '99.99% uptime SLA', isIncluded: true },
      { name: 'On-prem & air-gapped options', isIncluded: true },
      { name: '24/7 support + pager', isIncluded: true },
    ],
  },
]
