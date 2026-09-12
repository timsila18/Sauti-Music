"use client";

import {useActionState} from "react";
import {requestPayoutAction,type PayoutActionState} from "@/app/wallet-actions";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const initialState:PayoutActionState={status:"idle"};

export function PayoutForm({available,minimum,currency}:{available:number;minimum:number;currency:string}){
  const[state,action,pending]=useActionState(requestPayoutAction,initialState);
  const enabled=available>=minimum;
  return <form action={action} className="mt-7 rounded-2xl bg-white/10 p-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <div><Label htmlFor="payout-amount" className="text-white">Amount</Label><Input id="payout-amount" name="amount" type="number" min={minimum} max={available} step="0.01" defaultValue={enabled?available:minimum} disabled={!enabled||pending} className="mt-2 bg-white text-plum"/></div>
      <div><Label htmlFor="payout-phone" className="text-white">M-Pesa number</Label><Input id="payout-phone" name="phone" type="tel" inputMode="tel" placeholder="0712 345 678" required disabled={!enabled||pending} className="mt-2 bg-white text-plum"/></div>
    </div>
    <Button type="submit" disabled={!enabled||pending} className="mt-4 bg-white text-plum hover:bg-white/90">{pending?"Submitting…":`Request ${currency} payout`}</Button>
    {state.message?<p aria-live="polite" className={`mt-3 text-sm ${state.status==="error"?"text-white":"text-lime"}`}>{state.message}</p>:null}
  </form>;
}
