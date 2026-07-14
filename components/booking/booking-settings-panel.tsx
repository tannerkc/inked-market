"use client";

import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SelectRow, ToggleRow } from "./form-rows";
import { useBookingSettings } from "./use-booking-settings";
import type { BookingSettingsInput, ConsultLocation, SlotGranularity } from "@/lib/types/booking";

const US_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

interface BookingSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function BookingSettingsPanel({ open, onClose }: BookingSettingsPanelProps) {
  const { entity, settings, update, save, loading, saving, error } = useBookingSettings();
  const isStudio = Boolean(entity?.studioId);

  const set =
    <K extends keyof BookingSettingsInput>(key: K) =>
    (value: BookingSettingsInput[K]) =>
      update(key, value);

  return (
    <SlideOverPanel open={open} onClose={onClose} title="Booking Settings">
      {loading ? (
        <p className="p-4 font-mono text-[12px] text-ink-black/40 dark:text-ink-cream/40">
          Loading...
        </p>
      ) : (
        <div className="flex flex-col gap-5 p-4">
          <ToggleRow
            label="Accepting bookings"
            hint="Master switch for every booking flow"
            checked={settings.acceptingBookings}
            onChange={set("acceptingBookings")}
          />
          <ToggleRow
            label="Custom work requests"
            hint="Clients send a design brief for your review"
            checked={settings.customRequestsEnabled}
            onChange={set("customRequestsEnabled")}
          />
          <ToggleRow
            label="Consultations"
            hint="Bookable consult slots before committing"
            checked={settings.consultationsEnabled}
            onChange={set("consultationsEnabled")}
          />
          <ToggleRow
            label="Flash booking"
            hint="Pre-priced designs bookable instantly"
            checked={settings.flashEnabled}
            onChange={set("flashEnabled")}
          />
          {isStudio ? (
            <ToggleRow
              label="Walk-ins"
              hint="Studio-level bookings not tied to one artist"
              checked={settings.walkInsEnabled}
              onChange={set("walkInsEnabled")}
            />
          ) : null}

          {settings.consultationsEnabled ? (
            <>
              <SelectRow
                label="Consult length"
                value={settings.consultDurationMin}
                options={[15, 30, 45, 60].map((v) => ({ value: v, label: `${v} min` }))}
                onChange={(v) => update("consultDurationMin", Number(v))}
              />
              <SelectRow
                label="Consult price"
                value={settings.consultPriceCents}
                options={[0, 2500, 5000, 10000].map((v) => ({
                  value: v,
                  label: v === 0 ? "Free" : `$${v / 100}`,
                }))}
                onChange={(v) => update("consultPriceCents", Number(v))}
              />
              <SelectRow
                label="Consult location"
                value={settings.consultLocation}
                options={[
                  { value: "in_person", label: "In person" },
                  { value: "virtual", label: "Virtual" },
                ]}
                onChange={(v) => update("consultLocation", v as ConsultLocation)}
              />
            </>
          ) : null}

          <SelectRow
            label="Default deposit"
            value={settings.defaultDepositCents}
            options={[0, 5000, 10000, 15000, 20000].map((v) => ({
              value: v,
              label: v === 0 ? "No deposit" : `$${v / 100}`,
            }))}
            onChange={(v) => update("defaultDepositCents", Number(v))}
          />
          <SelectRow
            label="Slot size"
            value={settings.slotGranularityMin}
            options={[15, 30, 60].map((v) => ({ value: v, label: `${v} min` }))}
            onChange={(v) => update("slotGranularityMin", Number(v) as SlotGranularity)}
          />
          <SelectRow
            label="Buffer between appointments"
            value={settings.bufferMin}
            options={[0, 15, 30, 60].map((v) => ({ value: v, label: v ? `${v} min` : "None" }))}
            onChange={(v) => update("bufferMin", Number(v))}
          />
          <SelectRow
            label="Minimum notice"
            value={settings.minNoticeHours}
            options={[
              { value: 0, label: "None" },
              { value: 12, label: "12 hours" },
              { value: 24, label: "24 hours" },
              { value: 48, label: "2 days" },
              { value: 168, label: "1 week" },
            ]}
            onChange={(v) => update("minNoticeHours", Number(v))}
          />
          <SelectRow
            label="Booking window"
            value={settings.maxHorizonDays}
            options={[
              { value: 30, label: "30 days out" },
              { value: 60, label: "60 days out" },
              { value: 90, label: "90 days out" },
              { value: 180, label: "6 months out" },
            ]}
            onChange={(v) => update("maxHorizonDays", Number(v))}
          />
          <SelectRow
            label="Timezone"
            value={settings.timezone}
            options={US_TIMEZONES.map((tz) => ({
              value: tz,
              label: (tz.split("/")[1] ?? tz).replace(/_/g, " "),
            }))}
            onChange={set("timezone")}
          />

          <Textarea
            label="Cancellation policy"
            value={settings.cancellationPolicyText ?? ""}
            onChange={(e) => update("cancellationPolicyText", e.target.value || null)}
            placeholder="Deposits are non-refundable within 48 hours of the appointment..."
            rows={3}
          />

          {error ? <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p> : null}

          <Button
            onClick={async () => {
              await save();
              onClose();
            }}
            disabled={saving || !entity}
            className="min-h-[44px]"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
    </SlideOverPanel>
  );
}
