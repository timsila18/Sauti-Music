"use client";
import{useActionState}from"react";
import{distributeProfitAction,type TreasuryState}from"@/app/admin/treasury/actions";
import{Button}from"@/components/ui/button";import{Input}from"@/components/ui/input";import{Label}from"@/components/ui/label";
const initial:TreasuryState={status:"idle"};
export function ProfitDistributionForm(){const[state,action,pending]=useActionState(distributeProfitAction,initial);return <form action={action} className="grid gap-4"><div><Label htmlFor="profit-amount">Approved net profit (KSh)</Label><Input id="profit-amount" name="amount" type="number" min="1" step="0.01" required/></div><div><Label htmlFor="profit-period">Accounting period</Label><Input id="profit-period" name="period" placeholder="September 2026" required/></div><div><Label htmlFor="profit-note">Supporting note</Label><Input id="profit-note" name="note" placeholder="Reference the approved accounts or resolution" required/></div><Button disabled={pending}>{pending?"Distributing…":"Distribute net profit"}</Button>{state.message?<p role="status" className={state.status==="error"?"text-sm text-destructive":"text-sm text-success"}>{state.message}</p>:null}</form>}
