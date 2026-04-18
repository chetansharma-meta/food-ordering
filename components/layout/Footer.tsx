import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container py-8 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} FoodOrder, Inc. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/about" className="text-sm hover:underline">About</Link>
          <Link href="/contact" className="text-sm hover:underline">Contact</Link>
          <Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
