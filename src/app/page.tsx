import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "Lokalt: hitta rätt beslutsfattare i Helsingfors",
  description:
    "Beskriv problemet. Lokalt läser vad du skriver och avgör vilken väg som passar: en snabb felanmälan, ett mejl till rätt nämnd, rätt instans för ett redan fattat beslut, eller rätt kanal för en ny idé.",
};

export default function LandingPage() {
  return <LandingClient />;
}
