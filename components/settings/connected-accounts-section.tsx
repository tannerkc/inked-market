"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { SettingsSection } from "./settings-section";
import { ListGroup } from "@/components/dashboard";

interface ProviderCardProps {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  detail?: string;
  showImport?: boolean;
}

function ProviderCard({ name, icon, connected, detail, showImport }: ProviderCardProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-ink-black/[0.04] dark:bg-ink-cream/[0.04]">
          {icon}
        </div>
        <div>
          <p className="text-[12px] font-medium text-ink-black/60 dark:text-ink-cream/60">
            {name}
          </p>
          {connected && detail && (
            <p className="text-[10px] text-ink-black/25 dark:text-ink-cream/25">
              {detail}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {connected && showImport && (
          <span className="font-mono text-[8px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-ink-black/[0.04] text-ink-black/25 dark:bg-ink-cream/[0.04] dark:text-ink-cream/25">
            Coming Soon
          </span>
        )}
        <span className="font-mono text-[8px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-md bg-ink-black/[0.04] text-ink-black/25 dark:bg-ink-cream/[0.04] dark:text-ink-cream/25">
          Coming Soon
        </span>
      </div>
    </div>
  );
}

export function ConnectedAccountsSection() {
  const { user } = useAuth();
  const isArtist = user?.role === "artist";

  const iconClass = "w-4 h-4 text-ink-black/40 dark:text-ink-cream/40";

  return (
    <SettingsSection
      title="Connected Accounts"
      description="Manage your linked social accounts and login methods"
    >
      <ListGroup>
        <ProviderCard
          name="Instagram"
          icon={
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          }
          connected={false}
          showImport={isArtist}
        />
        <ProviderCard
          name="Google"
          icon={
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
          connected={false}
        />
        <ProviderCard
          name="Apple"
          icon={
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          }
          connected={false}
        />
      </ListGroup>

      <p className="text-[10px] mt-3 px-1 text-ink-black/20 dark:text-ink-cream/20">
        Social login and account linking will be available when the platform launches. For now, email and password is the only login method.
      </p>
    </SettingsSection>
  );
}
