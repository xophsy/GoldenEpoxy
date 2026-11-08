import type { Metadata } from "next";
import CrownCheck from "@/components/CrownCheck";

export const metadata: Metadata = {
  title: "Crown playback check",
  robots: { index: false, follow: false },
};

export default function AnimationCheckPage() {
  return <CrownCheck />;
}
