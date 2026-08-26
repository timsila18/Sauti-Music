import { CheckCircle2, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
export function AuthMessage({ status, message }: { status:"idle"|"error"|"success"; message?:string }) { if(!message) return null; const success=status==="success"; return <div role={success?"status":"alert"} className={cn("flex gap-3 rounded-xl p-3 text-sm",success?"bg-lime/35 text-plum":"bg-coral/10 text-destructive")}>{success?<CheckCircle2 className="mt-0.5 size-4 shrink-0" />:<CircleAlert className="mt-0.5 size-4 shrink-0" />}<p>{message}</p></div>; }
