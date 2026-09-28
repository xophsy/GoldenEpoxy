import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MaterialPlanner from "@/components/MaterialPlanner";
import { hasAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Simiron Material Planner",
  robots: { index: false, follow: false },
};

export default async function MaterialPlannerPage() {
  if (!(await hasAdminSession())) redirect("/admin");
  return <MaterialPlanner />;
}
