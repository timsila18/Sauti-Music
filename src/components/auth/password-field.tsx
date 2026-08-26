"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function PasswordField({ name="password", label="Password", autoComplete="current-password" }: { name?:string; label?:string; autoComplete?:string }) { const [visible,setVisible]=useState(false); return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><div className="relative"><Input id={name} name={name} type={visible?"text":"password"} minLength={8} autoComplete={autoComplete} required className="h-12 rounded-xl pr-12" /><button type="button" onClick={()=>setVisible(v=>!v)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label={visible?"Hide password":"Show password"}>{visible?<EyeOff className="size-4" />:<Eye className="size-4" />}</button></div></div>; }
