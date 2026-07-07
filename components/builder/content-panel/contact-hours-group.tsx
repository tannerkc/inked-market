"use client";

import { useStudio } from "@/lib/providers/studio-provider";
import { STUDIO_HOUR_OPTIONS } from "@/lib/constants/schedule";
import type { BusinessHours, StudioData } from "@/lib/repositories";
import { GroupSection } from "./group-section";
import { PanelInput, PANEL_SELECT_CLASS, useSavedFlash } from "./fields";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_DAY = { open: "10:00 AM", close: "6:00 PM", closed: false };

export function ContactHoursGroup({ highlighted }: { highlighted?: boolean }) {
  const { studio, update } = useStudio();
  const { saved, flash } = useSavedFlash();
  const hours: BusinessHours = studio?.hours ?? {};

  const commit = (partial: Partial<StudioData>) => {
    void update(partial).then(flash);
  };

  const setDay = (day: string, patch: Partial<typeof DEFAULT_DAY>) => {
    const current = hours[day] ?? { ...DEFAULT_DAY };
    commit({ hours: { ...hours, [day]: { ...current, ...patch } } });
  };

  return (
    <GroupSection id="contact-hours" title="Contact & Hours" saved={saved} highlighted={highlighted}>
      <div className="grid grid-cols-2 gap-2">
        <PanelInput label="Phone" type="tel" value={studio?.phone ?? ""} onCommit={(phone) => commit({ phone })} placeholder="(555) 555-0142" />
        <PanelInput label="Email" type="email" value={studio?.email ?? ""} onCommit={(email) => commit({ email })} placeholder="studio@email.com" />
      </div>
      <PanelInput label="Street Address" value={studio?.address ?? ""} onCommit={(address) => commit({ address })} placeholder="123 Main St" />
      <div className="grid grid-cols-3 gap-2">
        <PanelInput label="City" value={studio?.city ?? ""} onCommit={(city) => commit({ city })} placeholder="City" />
        <PanelInput label="State" value={studio?.state ?? ""} onCommit={(state) => commit({ state })} placeholder="OR" />
        <PanelInput label="Zip" value={studio?.zipCode ?? ""} onCommit={(zipCode) => commit({ zipCode })} placeholder="97214" />
      </div>

      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[1.5px] text-chrome-text-dim">
          Weekly Hours
        </span>
        <div className="space-y-1.5">
          {DAYS.map((day) => {
            const h = hours[day] ?? { ...DEFAULT_DAY, closed: true };
            return (
              <div key={day} className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={!h.closed}
                  aria-label={`${day} open`}
                  onClick={() => setDay(day, { closed: !h.closed })}
                  className={cn(
                    "w-[72px] shrink-0 rounded-md border px-2 py-1.5 text-left text-[10px] font-semibold transition-colors",
                    h.closed
                      ? "border-chrome-border text-chrome-text-faint"
                      : "border-ink-red/50 bg-ink-red/10 text-ink-red",
                  )}
                >
                  {day.slice(0, 3)}
                </button>
                {h.closed ? (
                  <span className="text-[10px] text-chrome-text-faint">Closed</span>
                ) : (
                  <>
                    <select
                      value={h.open}
                      onChange={(e) => setDay(day, { open: e.target.value })}
                      aria-label={`${day} open time`}
                      className={PANEL_SELECT_CLASS}
                    >
                      {STUDIO_HOUR_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-chrome-text-faint">&ndash;</span>
                    <select
                      value={h.close}
                      onChange={(e) => setDay(day, { close: e.target.value })}
                      aria-label={`${day} close time`}
                      className={PANEL_SELECT_CLASS}
                    >
                      {STUDIO_HOUR_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GroupSection>
  );
}
