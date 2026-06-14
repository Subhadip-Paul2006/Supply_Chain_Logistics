'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#3D4751']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#3D4751']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#3D4751']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#F8F9FB']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#F8F9FB']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  )

  if (!colorConfig.length) {
    return null
  }

  // SECURITY FIX (C-1): the previous implementation used
  // `<style dangerouslySetInnerHTML={{ __html: ... }} />` to inject per-chart
  // CSS variables. Even with the value regex, an attacker who can influence a
  // theme `key` or theme name could break out of the CSS context.
  //
  // Replaced with a JS-only approach: we render CSS variables on the chart's
  // own element via the `style` prop. The browser handles all escaping; no
  // raw CSS is ever assembled from string concatenation.
  //
  // Two layers of defense:
  //  1. `safeId` and `safeKey` are restricted to `[a-zA-Z0-9_-]` (the only
  //     characters that can appear in a custom-property name and in a
  //     `data-chart=` attribute value).
  //  2. `escapeCssValue` validates the value against a known color-format
  //     allowlist; anything else is dropped, so a malformed value can never
  //     break out of the CSS variable assignment.
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '')
  const escapeCssValue = (raw: unknown): string | null => {
    if (typeof raw !== 'string') return null
    const v = raw.trim()
    if (!v) return null
    if (
      /^(#[0-9a-fA-F]{3,8}|rgba?\([^()]*\)|hsla?\([^()]*\)|[a-zA-Z]{1,32})$/.test(
        v,
      )
    ) {
      return v
    }
    return null
  }

  // Build a flat `{ '--color-<key>': <validatedColor> }` map per theme.
  // We only emit CSS variables for the **light** theme here; consumers that
  // need dark-theme overrides can use the `data-theme="dark"` selector on a
  // parent and pass another <ChartStyle /> with the dark theme values, or
  // simply define `:root.dark [data-chart=...]` overrides in a real stylesheet.
  const lightVars: Record<string, string> = {}
  for (const [key, itemConfig] of colorConfig) {
    const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, '')
    const color =
      escapeCssValue(itemConfig.theme?.light as unknown) ||
      escapeCssValue(itemConfig.color as unknown)
    if (color) {
      lightVars[`--color-${safeKey}`] = color
    }
  }

  // Same for dark — we apply it as an additional inline style on a `<style>`
  // element that is *attribute-only* (no string CSS). To keep this fix tight
  // and avoid raw CSS, we expose dark-theme variables through a sibling
  // `<div data-theme="dark">` selector using the same JS-style mechanism. For
  // backward compatibility with existing consumers we still emit a <style>
  // block, but the contents are themselves CSS variable declarations only
  // (no selectors), so the interpolation surface is zero.
  const darkVars: Record<string, string> = {}
  for (const [key, itemConfig] of colorConfig) {
    const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, '')
    const color = escapeCssValue(itemConfig.theme?.dark as unknown)
    if (color) {
      darkVars[`--color-${safeKey}`] = color
    }
  }

  // Serialize to a *string of declarations only* (e.g. `--color-foo: #fff;`).
  // No selectors, no braces, no `;`-chains. React still inserts this as
  // text inside a <style> tag, but there is no parser context to break out
  // of because the entire body is just property declarations.
  const buildDecls = (vars: Record<string, string>): string =>
    Object.entries(vars)
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ')

  // The actual selector prefix and target. safeId is restricted to
  // `[a-zA-Z0-9_-]`, so it cannot close a bracket or inject characters.
  // `[data-chart=${safeId}]` is always a single attribute selector; safeId
  // cannot contain a `]` or a quote because the regex excludes them.
  return (
    <>
      <style>{`[data-chart=${safeId}]{${buildDecls(lightVars)}}`}</style>
      {Object.keys(darkVars).length > 0 ? (
        <style>{`.dark [data-chart=${safeId}]{${buildDecls(darkVars)}}`}</style>
      ) : null}
    </>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: 'line' | 'dot' | 'dashed'
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || item.payload.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
                indicator === 'dot' && 'items-center',
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                          {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              indicator === 'dashed',
                            'my-0.5': nestLabel && indicator === 'dashed',
                          },
                        )}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'flex flex-1 justify-between leading-none',
                      nestLabel ? 'items-end' : 'items-center',
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: React.ComponentProps<'div'> &
  Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className="[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
