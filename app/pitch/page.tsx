import type { Metadata } from "next";
import { PitchDeck } from "./deck";

export const metadata: Metadata = {
  title: "Pitch · Amparo",
  description:
    "Deck de presentación de Amparo: la cuarta parte que descongestiona la justicia en salud de Colombia. Navegable con teclado (←/→, Esc).",
};

export default function PitchPage() {
  return <PitchDeck />;
}
