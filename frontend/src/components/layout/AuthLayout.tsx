import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerHref: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  footerHref,
}: Props) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 dark:bg-brand-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Second Brain</span>
        </div>

        <div>
          <blockquote className="text-white/90 text-2xl font-light leading-relaxed mb-6">
            "The mind is not a vessel to be filled, but a fire to be kindled."
          </blockquote>
          <p className="text-white/60 text-sm">— Plutarch</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Items saved", value: "10K+" },
            { label: "Connections", value: "50K+" },
            { label: "Ideas resurfaced", value: "5K+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-2xl p-4">
              <p className="text-white text-2xl font-bold">{stat.value}</p>
              <p className="text-white/60 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">Second Brain</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link
              to={footerHref}
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              {footerLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
