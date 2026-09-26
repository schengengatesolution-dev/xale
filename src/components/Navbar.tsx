import { getSession } from "@/lib/auth";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const session = await getSession();
  return (
    <NavbarClient
      session={
        session ? { name: session.name, role: session.role } : null
      }
    />
  );
}
