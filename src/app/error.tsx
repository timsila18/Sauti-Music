"use client";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="grid min-h-svh place-items-center px-5"><section className="max-w-md rounded-3xl bg-card p-8 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-coral/15 text-coral"><AlertCircle/></span><h1 className="mt-5 text-3xl font-medium text-plum">That beat skipped.</h1><p className="mt-3 text-muted-foreground">Sauti couldn&apos;t load this screen. Your saved activity and money are safe.</p><div className="mt-7 flex justify-center gap-2"><Button onClick={reset}><RotateCcw/>Try again</Button><Button asChild variant="outline"><Link href="/">Go home</Link></Button></div></section></main>}
