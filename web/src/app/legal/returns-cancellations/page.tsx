import { redirect } from "next/navigation";

export default function ReturnsCancellationsRedirect() {
  redirect("/legal/return-policy");
}
