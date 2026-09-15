import { redirect } from "next/navigation";

export default function SellerInterestsRedirect() {
  redirect("/seller/reservations");
}
