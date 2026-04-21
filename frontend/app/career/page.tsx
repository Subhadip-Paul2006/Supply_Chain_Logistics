import type { Metadata } from "next"
import { CareerExperience } from "./career-page"

export const metadata: Metadata = {
  title: "Careers - Join the War Room",
  description:
    "Join the Agentic Supply Chain War Room and help build the next generation of AI-native logistics software.",
}

export default function CareerPage() {
  return <CareerExperience />
}
