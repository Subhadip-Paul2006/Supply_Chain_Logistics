import type { Metadata } from "next"
import { CustomersExperience } from "./customers-page"

export const metadata: Metadata = {
  title: "Customers & Impact - R3FLEX",
  description:
    "See how the Agentic Supply Chain War Room outperforms traditional supply chains across response time, rerouting accuracy, and network resilience.",
}

export default function CustomersPage() {
  return <CustomersExperience />
}
