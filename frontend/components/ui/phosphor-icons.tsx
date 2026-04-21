import * as React from "react"
import type { Icon, IconProps } from "@phosphor-icons/react"
import { PulseIcon } from "@phosphor-icons/react/dist/ssr/Pulse"
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning"
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown"
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight"
import { RobotIcon } from "@phosphor-icons/react/dist/ssr/Robot"
import { BrainIcon } from "@phosphor-icons/react/dist/ssr/Brain"
import { CircuitryIcon } from "@phosphor-icons/react/dist/ssr/Circuitry"
import { BuildingsIcon } from "@phosphor-icons/react/dist/ssr/Buildings"
import { CheckIcon as PhosphorCheckIcon } from "@phosphor-icons/react/dist/ssr/Check"
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft"
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight"
import { CaretUpIcon } from "@phosphor-icons/react/dist/ssr/CaretUp"
import { CircleIcon as PhosphorCircleIcon } from "@phosphor-icons/react/dist/ssr/Circle"
import { ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock"
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code"
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix"
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database"
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr/CurrencyDollar"
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye"
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash"
import { FacebookLogoIcon } from "@phosphor-icons/react/dist/ssr/FacebookLogo"
import { FileDocIcon } from "@phosphor-icons/react/dist/ssr/FileDoc"
import { FlameIcon } from "@phosphor-icons/react/dist/ssr/Flame"
import { GitBranchIcon } from "@phosphor-icons/react/dist/ssr/GitBranch"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo"
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/ssr/GlobeHemisphereWest"
import { DotsSixVerticalIcon } from "@phosphor-icons/react/dist/ssr/DotsSixVertical"
import { QuestionIcon } from "@phosphor-icons/react/dist/ssr/Question"
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/ssr/InstagramLogo"
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr/LinkedinLogo"
import { SpinnerIcon } from "@phosphor-icons/react/dist/ssr/Spinner"
import { MapTrifoldIcon } from "@phosphor-icons/react/dist/ssr/MapTrifold"
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List"
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/ssr/ChatCircleText"
import { MinusIcon as PhosphorMinusIcon } from "@phosphor-icons/react/dist/ssr/Minus"
import { MoonIcon } from "@phosphor-icons/react/dist/ssr/Moon"
import { DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree"
import { NetworkIcon } from "@phosphor-icons/react/dist/ssr/Network"
import { PlanetIcon } from "@phosphor-icons/react/dist/ssr/Planet"
import { PackageIcon } from "@phosphor-icons/react/dist/ssr/Package"
import { SidebarSimpleIcon } from "@phosphor-icons/react/dist/ssr/SidebarSimple"
import { PillIcon } from "@phosphor-icons/react/dist/ssr/Pill"
import { QuotesIcon } from "@phosphor-icons/react/dist/ssr/Quotes"
import { CrosshairSimpleIcon } from "@phosphor-icons/react/dist/ssr/CrosshairSimple"
import { RepeatIcon } from "@phosphor-icons/react/dist/ssr/Repeat"
import { RocketIcon } from "@phosphor-icons/react/dist/ssr/Rocket"
import { PathIcon } from "@phosphor-icons/react/dist/ssr/Path"
import { BroadcastIcon } from "@phosphor-icons/react/dist/ssr/Broadcast"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass"
import { ShieldWarningIcon } from "@phosphor-icons/react/dist/ssr/ShieldWarning"
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck"
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle"
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star"
import { SunIcon } from "@phosphor-icons/react/dist/ssr/Sun"
import { SyringeIcon } from "@phosphor-icons/react/dist/ssr/Syringe"
import { ThermometerIcon } from "@phosphor-icons/react/dist/ssr/Thermometer"
import { TimerIcon } from "@phosphor-icons/react/dist/ssr/Timer"
import { TrendDownIcon } from "@phosphor-icons/react/dist/ssr/TrendDown"
import { TrendUpIcon } from "@phosphor-icons/react/dist/ssr/TrendUp"
import { TwitterLogoIcon } from "@phosphor-icons/react/dist/ssr/TwitterLogo"
import { WavesIcon } from "@phosphor-icons/react/dist/ssr/Waves"
import { FlowArrowIcon } from "@phosphor-icons/react/dist/ssr/FlowArrow"
import { XIcon as PhosphorXIcon } from "@phosphor-icons/react/dist/ssr/X"
import { LightningIcon } from "@phosphor-icons/react/dist/ssr/Lightning"
import { cn } from "@/lib/utils"

const phosphorClassName =
  "shrink-0 transition-colors [&>*]:transition-colors [&>*]:fill-current [&>*[opacity]]:fill-primary/25"

function createIcon(IconComponent: Icon) {
  const WrappedIcon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ className, ...props }, ref) => (
      <IconComponent
        ref={ref}
        {...props}
        weight="duotone"
        className={cn(phosphorClassName, className)}
      />
    ),
  )

  WrappedIcon.displayName = "PhosphorIconAdapter"

  return WrappedIcon
}

export const Activity = createIcon(PulseIcon)
export const AlertTriangle = createIcon(WarningIcon)
export const ArrowDown = createIcon(ArrowDownIcon)
export const ArrowLeft = createIcon(ArrowLeftIcon)
export const ArrowRight = createIcon(ArrowRightIcon)
export const Bot = createIcon(RobotIcon)
export const Brain = createIcon(BrainIcon)
export const BrainCircuit = createIcon(CircuitryIcon)
export const Building2 = createIcon(BuildingsIcon)
export const Check = createIcon(PhosphorCheckIcon)
export const CheckIcon = createIcon(PhosphorCheckIcon)
export const ChevronDown = createIcon(CaretDownIcon)
export const ChevronDownIcon = createIcon(CaretDownIcon)
export const ChevronLeftIcon = createIcon(CaretLeftIcon)
export const ChevronRight = createIcon(CaretRightIcon)
export const ChevronRightIcon = createIcon(CaretRightIcon)
export const ChevronUpIcon = createIcon(CaretUpIcon)
export const CircleIcon = createIcon(PhosphorCircleIcon)
export const Clock3 = createIcon(ClockIcon)
export const Code2 = createIcon(CodeIcon)
export const Cog = createIcon(GearSixIcon)
export const DatabaseZap = createIcon(DatabaseIcon)
export const DollarSign = createIcon(CurrencyDollarIcon)
export const Eye = createIcon(EyeIcon)
export const EyeOff = createIcon(EyeSlashIcon)
export const Facebook = createIcon(FacebookLogoIcon)
export const FileCheck2 = createIcon(FileDocIcon)
export const Flame = createIcon(FlameIcon)
export const GitBranch = createIcon(GitBranchIcon)
export const Github = createIcon(GithubLogoIcon)
export const Globe2 = createIcon(GlobeHemisphereWestIcon)
export const GripVerticalIcon = createIcon(DotsSixVerticalIcon)
export const HelpCircle = createIcon(QuestionIcon)
export const Instagram = createIcon(InstagramLogoIcon)
export const Linkedin = createIcon(LinkedinLogoIcon)
export const Loader2Icon = createIcon(SpinnerIcon)
export const Map = createIcon(MapTrifoldIcon)
export const Menu = createIcon(ListIcon)
export const MessageCircle = createIcon(ChatCircleTextIcon)
export const MinusIcon = createIcon(PhosphorMinusIcon)
export const Moon = createIcon(MoonIcon)
export const MoreHorizontal = createIcon(DotsThreeIcon)
export const MoreHorizontalIcon = createIcon(DotsThreeIcon)
export const Network = createIcon(NetworkIcon)
export const Orbit = createIcon(PlanetIcon)
export const Package = createIcon(PackageIcon)
export const PanelLeftIcon = createIcon(SidebarSimpleIcon)
export const Pill = createIcon(PillIcon)
export const Quote = createIcon(QuotesIcon)
export const Radar = createIcon(CrosshairSimpleIcon)
export const Repeat = createIcon(RepeatIcon)
export const Rocket = createIcon(RocketIcon)
export const Route = createIcon(PathIcon)
export const Satellite = createIcon(BroadcastIcon)
export const SearchIcon = createIcon(MagnifyingGlassIcon)
export const ShieldAlert = createIcon(ShieldWarningIcon)
export const ShieldCheck = createIcon(ShieldCheckIcon)
export const Sparkles = createIcon(SparkleIcon)
export const Star = createIcon(StarIcon)
export const Sun = createIcon(SunIcon)
export const Syringe = createIcon(SyringeIcon)
export const Thermometer = createIcon(ThermometerIcon)
export const Timer = createIcon(TimerIcon)
export const TrendingDown = createIcon(TrendDownIcon)
export const TrendingUp = createIcon(TrendUpIcon)
export const Twitter = createIcon(TwitterLogoIcon)
export const Waves = createIcon(WavesIcon)
export const Workflow = createIcon(FlowArrowIcon)
export const X = createIcon(PhosphorXIcon)
export const XIcon = createIcon(PhosphorXIcon)
export const Zap = createIcon(LightningIcon)
