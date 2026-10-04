import { redirect } from "next/navigation";

export default function WikiPage() {
  redirect("/journal?tab=wiki");
}