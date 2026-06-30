import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
      <div>
        <p className="font-heading text-primary text-6xl font-bold">404</p>
        <h1 className="font-heading mt-4 text-2xl font-semibold">
          Lost in the multiverse
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          We couldn&apos;t find that page. The anime you&apos;re looking for
          might not exist — or never aired.
        </p>
        <Link href="/" className={`${buttonVariants()} mt-6 h-10 px-5`}>
          Back to Discover
        </Link>
      </div>
    </div>
  );
}
