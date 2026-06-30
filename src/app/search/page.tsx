import { redirect } from "next/navigation";

interface SearchRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Search has merged into the unified Browse surface at "/".
// This route stays as a redirect so old links and bookmarks keep working.
export default async function SearchRedirect({
  searchParams,
}: SearchRedirectProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }
  const qs = params.toString();
  redirect(qs ? `/?${qs}` : "/");
}
