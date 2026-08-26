"use client";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export function SubmitButton({ children }: { children:React.ReactNode }) { const { pending }=useFormStatus(); return <Button type="submit" disabled={pending} className="h-12 w-full rounded-full text-base">{pending?<><LoaderCircle className="animate-spin" />Please wait</>:children}</Button>; }
