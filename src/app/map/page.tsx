import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { MapDiscovery } from "@/components/map/MapDiscovery";
import { isCheckoutEnabled } from "@/lib/qpay";

export const metadata: Metadata = {
  title: "Газрын зураг",
  description: "Ойролцоох Азтай уутнуудыг газрын зураг дээр ол — Улаанбаатар.",
};

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const session = await getSession();
  return (
    <MapDiscovery
      initialSession={
        session
          ? { id: session.id, role: session.role, name: session.name }
          : null
      }
      checkoutEnabled={isCheckoutEnabled()}
    />
  );
}
