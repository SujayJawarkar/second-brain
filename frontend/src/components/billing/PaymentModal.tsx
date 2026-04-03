import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Crown,
  CreditCard,
  Lock,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/auth.store";

type Step = "form" | "processing" | "success";

interface Props {
  open: boolean;
  onClose: () => void;
}

// Luhn check for basic card validation feel
function luhn(n: string) {
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d;
}

// ── Processing animation steps ───────────────────────────────────────────────
const STEPS = [
  "Connecting to payment gateway…",
  "Verifying card details…",
  "Authorising ₹299…",
  "Confirming with Razorpay…",
  "Upgrading your plan…",
];

export default function PaymentModal({ open, onClose }: Props) {
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<Step>("form");

  // Card form state
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [upi, setUpi] = useState("");
  const [method, setMethod] = useState<"card" | "upi">("card");

  // Processing animation state
  const [procStep, setProcStep] = useState(0);

  // Reset when re-opened
  useEffect(() => {
    if (open) {
      setStep("form");
      setCard(""); setExpiry(""); setCvv(""); setName(""); setUpi("");
      setProcStep(0);
      setMethod("card");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && step === "form") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose, step]);

  const upgradeMutation = useMutation({
    mutationFn: () => authApi.upgradeToPro(),
    onSuccess: (res) => {
      const { user, token } = res.data;
      setAuth(user, token);
      setStep("success");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Upgrade failed. Please try again.");
      setStep("form");
    },
  });

  // Run the animated processing sequence, then hit the real API
  const runPaymentFlow = () => {
    setStep("processing");
    setProcStep(0);
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setProcStep(i);
      if (i >= STEPS.length) {
        clearInterval(iv);
        upgradeMutation.mutate();
      }
    }, 700);
  };

  const cardRaw = card.replace(/\s/g, "");
  const cardValid =
    method === "upi"
      ? upi.includes("@") && upi.length > 4
      : name.trim().length > 1 &&
        cardRaw.length === 16 &&
        luhn(cardRaw) &&
        expiry.replace(/\s/g, "").length === 5 &&
        cvv.length >= 3;

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={step === "form" ? onClose : undefined}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden
            animate-in fade-in zoom-in-95 duration-200"
        >
          {/* ── Success state ──────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center text-center px-8 py-12 gap-5">
              {/* Animated checkmark ring */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
                  border: "2px solid #10b981",
                }}
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">Welcome to Pro! 🎉</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Your account has been upgraded. All Pro features are now unlocked — semantic
                  search, PDF ingestion, knowledge graph, and more.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {["Semantic Search", "PDF Ingestion", "Knowledge Graph", "Unlimited Items"].map(
                  (f) => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                    >
                      ✓ {f}
                    </span>
                  )
                )}
              </div>

              <Button
                className="mt-2 w-full"
                style={{ background: "rgb(var(--brand))" }}
                onClick={onClose}
                id="success-close-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start exploring Pro features
              </Button>
            </div>
          )}

          {/* ── Processing state ───────────────────────────────────────────── */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center text-center px-8 py-12 gap-6">
              {/* Razorpay-like spinner */}
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full"
                  style={{
                    background: "rgb(var(--brand))",
                    opacity: 0.12,
                    position: "absolute",
                    inset: 0,
                    borderRadius: "9999px",
                  }}
                />
                <div className="w-16 h-16 flex items-center justify-center">
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: "rgb(var(--brand))" }}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">Processing payment…</h2>
                <p className="text-sm text-muted-foreground mt-1">Please don't close this window</p>
              </div>

              {/* Step progress */}
              <div className="w-full space-y-2">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${
                      i < procStep
                        ? "text-emerald-500"
                        : i === procStep
                        ? "text-foreground font-medium"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {i < procStep ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    ) : i === procStep ? (
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: "rgb(var(--brand))" }} />
                    ) : (
                      <div className="w-4 h-4 shrink-0 rounded-full border border-muted-foreground/30" />
                    )}
                    {s}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secured by Razorpay
              </div>
            </div>
          )}

          {/* ── Payment form ───────────────────────────────────────────────── */}
          {step === "form" && (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgb(var(--brand))" }}
                >
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-foreground">Upgrade to Pro</h2>
                  <p className="text-xs text-muted-foreground">₹299 / month · Cancel anytime</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Method tabs */}
              <div className="flex border-b border-border">
                {(["card", "upi"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-colors
                      ${method === m
                        ? "border-b-2 text-brand"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                    style={method === m ? { borderColor: "rgb(var(--brand))" } : {}}
                  >
                    {m === "card" ? "💳 Card" : "📱 UPI"}
                  </button>
                ))}
              </div>

              <div className="px-5 py-5 space-y-4">
                {method === "card" ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Cardholder name
                      </label>
                      <Input
                        id="card-name"
                        value={name}
                        onChange={(e: any) => setName(e.target.value)}
                        placeholder="Sujay Jawarkar"
                        autoComplete="cc-name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Card number
                      </label>
                      <div className="relative">
                        <Input
                          id="card-number"
                          value={card}
                          onChange={(e: any) => setCard(formatCard(e.target.value))}
                          placeholder="4242 4242 4242 4242"
                          autoComplete="cc-number"
                          maxLength={19}
                          className="pr-10"
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Use <span className="font-mono font-medium text-foreground">4242 4242 4242 4242</span> · any future date · any CVV
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          Expiry
                        </label>
                        <Input
                          id="card-expiry"
                          value={expiry}
                          onChange={(e: any) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM / YY"
                          autoComplete="cc-exp"
                          maxLength={7}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          CVV
                        </label>
                        <Input
                          id="card-cvv"
                          value={cvv}
                          onChange={(e: any) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          autoComplete="cc-csc"
                          type="password"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      UPI ID
                    </label>
                    <Input
                      id="upi-id"
                      value={upi}
                      onChange={(e: any) => setUpi(e.target.value)}
                      placeholder="yourname@upi"
                      autoComplete="off"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Enter any UPI ID (e.g.{" "}
                      <span className="font-mono font-medium text-foreground">demo@paytm</span>) for this demo
                    </p>
                  </div>
                )}

                {/* Pay button */}
                <Button
                  id="pay-now-btn"
                  className="w-full text-white mt-2"
                  style={{ background: "rgb(var(--brand))" }}
                  disabled={!cardValid}
                  onClick={runPaymentFlow}
                >
                  <Lock className="w-3.5 h-3.5 mr-2 opacity-80" />
                  Pay ₹299 securely
                </Button>

                {/* Trust bar */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    256-bit SSL
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <span className="text-[10px] text-muted-foreground">
                    Powered by{" "}
                    <span className="font-semibold text-[#2D81F7]">Razorpay</span>
                  </span>
                  <div className="w-px h-3 bg-border" />
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Crown className="w-3 h-3" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
