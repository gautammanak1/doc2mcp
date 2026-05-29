"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SUBJECTS = [
  "General question",
  "Sales / pricing",
  "Refund or billing",
  "Bug report",
  "Feature request",
  "Partnership / press",
  "Other",
] as const;

type ContactResponse = { ok?: boolean; error?: string };

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      orderId: String(data.get("orderId") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      // honeypot — should remain empty for real users
      website: String(data.get("website") ?? "").trim(),
    };

    if (!(payload.name && payload.email && payload.message)) {
      toast.error("Name, email, and message are required.");
      return;
    }

    setPending(true);
    const t = toast.loading("Sending your message…");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as ContactResponse;
      if (!(res.ok && body.ok)) {
        toast.error(body.error ?? "Could not send your message.", { id: t });
        return;
      }
      toast.success("Thanks — we'll get back within 1 business day.", {
        id: t,
      });
      form.reset();
      setDone(true);
    } catch {
      toast.error("Network error. Please try again.", { id: t });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-sm">
        <p className="font-medium text-emerald-700 dark:text-emerald-300">
          Message received.
        </p>
        <p className="mt-1 text-muted-foreground">
          We reply to most enquiries within 1 business day. Check your email for
          our response.
        </p>
        <Button
          className="mt-4"
          onClick={() => setDone(false)}
          size="sm"
          type="button"
          variant="outline"
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-8"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" required={true}>
          <input
            autoComplete="name"
            className={inputCls}
            id="name"
            name="name"
            placeholder="Ada Lovelace"
            required={true}
            type="text"
          />
        </Field>
        <Field label="Email" name="email" required={true}>
          <input
            autoComplete="email"
            className={inputCls}
            id="email"
            name="email"
            placeholder="you@company.com"
            required={true}
            type="email"
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Subject" name="subject">
          <select
            className={inputCls}
            defaultValue={SUBJECTS[0]}
            id="subject"
            name="subject"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field
          hint="Optional — speeds up billing tickets"
          label="Razorpay order id"
          name="orderId"
        >
          <input
            className={inputCls}
            id="orderId"
            name="orderId"
            placeholder="order_XXXXXXXX"
            type="text"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Message" name="message" required={true}>
          <textarea
            className={`${inputCls} min-h-36 resize-y`}
            id="message"
            maxLength={4000}
            name="message"
            placeholder="What can we help with?"
            required={true}
          />
        </Field>
      </div>

      {/* Honeypot — hidden field; bots tend to fill every input. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          We reply within 1 business day. Most refunds processed in 7 days.
        </p>
        <Button disabled={pending} size="lg" type="submit">
          {pending ? (
            <>
              <Loader2 className="mr-1.5 size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="mr-1.5 size-4" />
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground/40 focus:bg-background";

function Field({
  label,
  name,
  required,
  hint,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={name}>
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          {label}
          {required ? <span className="ml-1 text-foreground/70">*</span> : null}
        </span>
        {hint ? (
          <span className="text-[10px] text-muted-foreground/70">{hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
