import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to /docs - Next.js will automatically handle basePath
  redirect("/docs");
}
