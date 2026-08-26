import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <main className="grid min-h-screen place-items-center px-5 text-center"><div><p className="text-sm font-medium text-coral">404</p><h1 className="mt-3 text-5xl font-medium text-plum">This beat moved on.</h1><p className="mt-4 text-muted-foreground">Let’s get you back to Sauti.</p><Button asChild className="mt-8 rounded-full"><Link href="/">Go home</Link></Button></div></main>; }
