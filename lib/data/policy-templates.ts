import type {
  StandardPolicyDefinition,
  StandardPolicyId,
  PolicyConfig,
} from "@/lib/types/policies";

export const standardPolicies: Record<StandardPolicyId, StandardPolicyDefinition> = {
  "booking-deposit": {
    id: "booking-deposit",
    title: "Booking & Deposit",
    cardLabel: "Deposit",
    cardValueTemplate: (f) => f.depositAmount ? `$${f.depositAmount}` : "",
    cardDetailTemplate: (f) =>
      f.depositType === "applies-to-total"
        ? "Applies to total"
        : "Non-refundable",
    structuredFields: [
      {
        key: "depositAmount",
        label: "Deposit Amount",
        inputType: "text",
      },
      {
        key: "depositType",
        label: "Deposit Type",
        inputType: "segmented",
        options: [
          { label: "Non-refundable", value: "non-refundable" },
          { label: "Applies to total", value: "applies-to-total" },
        ],
      },
    ],
    defaultBody: `All tattoo appointments require a deposit to secure your booking. This deposit is collected at the time of booking and guarantees your time slot with your chosen artist.

Our artists reserve time specifically for your appointment. The deposit compensates for turning away other potential bookings during that window.

Deposits can be made online at the time of booking or in-person at the studio. We accept credit/debit cards and cash.

For large-scale pieces requiring multiple sessions, a single deposit covers the entire project. Additional deposits are not required between sessions.`,
  },

  "cancellation-refund": {
    id: "cancellation-refund",
    title: "Cancellation & Refund",
    cardLabel: "Cancellation",
    cardValueTemplate: (f) => f.cancellationWindow ? `${f.cancellationWindow} notice` : "",
    cardDetailTemplate: (f) => {
      const map: Record<string, string> = {
        "deposit-forfeited": "Deposit forfeited for no-shows",
        "full-charge": "Full session charge for no-shows",
        "reschedule-only": "Reschedule only, no refunds",
      };
      return f.noShowPolicy ? map[f.noShowPolicy] ?? "" : "";
    },
    structuredFields: [
      {
        key: "cancellationWindow",
        label: "Cancellation Window",
        inputType: "segmented",
        options: [
          { label: "24 hours", value: "24 hours" },
          { label: "48 hours", value: "48 hours" },
          { label: "72 hours", value: "72 hours" },
        ],
      },
      {
        key: "noShowPolicy",
        label: "No-Show Policy",
        inputType: "segmented",
        options: [
          { label: "Deposit forfeited", value: "deposit-forfeited" },
          { label: "Full charge", value: "full-charge" },
          { label: "Reschedule only", value: "reschedule-only" },
        ],
      },
    ],
    defaultBody: `We understand that plans change. If you need to cancel or reschedule your appointment, please provide as much advance notice as possible.

Cancellations or reschedules made within the required notice window will result in forfeiture of your deposit. No-shows without any prior communication will also forfeit the deposit.

If you need to reschedule, we will do our best to accommodate your preferred date and time. Rescheduled appointments are subject to artist availability.

In the event of an emergency, please contact us as soon as possible. We handle emergencies on a case-by-case basis.

Refunds for completed tattoo work are not available. Tattoos are permanent and custom-made for each client.`,
  },

  aftercare: {
    id: "aftercare",
    title: "Aftercare",
    cardLabel: "Touch-Ups",
    cardValueTemplate: (f) => f.touchUpIncluded === "yes" ? "Free" : "Available",
    cardDetailTemplate: (f) =>
      f.touchUpWindow ? `Within ${f.touchUpWindow}` : "",
    structuredFields: [
      {
        key: "touchUpWindow",
        label: "Touch-Up Window",
        inputType: "segmented",
        options: [
          { label: "14 days", value: "14 days" },
          { label: "30 days", value: "30 days" },
          { label: "60 days", value: "60 days" },
          { label: "90 days", value: "90 days" },
        ],
      },
      {
        key: "touchUpIncluded",
        label: "Touch-Up Included",
        inputType: "toggle",
      },
    ],
    defaultBody: `Proper aftercare is essential for the longevity and appearance of your new tattoo. Your artist will provide detailed aftercare instructions specific to your tattoo's size, location, and style.

General aftercare guidelines:
- Keep the bandage on for the time recommended by your artist
- Wash gently with fragrance-free soap and lukewarm water
- Apply a thin layer of recommended aftercare ointment
- Avoid submerging in water (pools, baths, hot tubs) for at least 2 weeks
- Keep out of direct sunlight during healing
- Do not pick, scratch, or peel any flaking skin
- Wear loose, breathable clothing over the tattooed area

Healing typically takes 2-4 weeks, though larger pieces may take longer. If you experience unusual redness, swelling, or discharge beyond the first few days, contact your artist or a medical professional.

We are not liable for infections, allergic reactions, or poor healing outcomes resulting from failure to follow aftercare instructions.`,
  },

  "age-id": {
    id: "age-id",
    title: "Age & ID Requirements",
    cardLabel: "Age Policy",
    cardValueTemplate: (f) => f.minimumAge ? `${f.minimumAge} with valid ID` : "",
    cardDetailTemplate: (f) =>
      f.parentalConsentAllowed === "yes" ? "Parental consent accepted" : "No exceptions",
    structuredFields: [
      {
        key: "minimumAge",
        label: "Minimum Age",
        inputType: "segmented",
        options: [
          { label: "16+", value: "16+" },
          { label: "18+", value: "18+" },
          { label: "21+", value: "21+" },
        ],
      },
      {
        key: "idRequired",
        label: "ID Required",
        inputType: "toggle",
      },
      {
        key: "parentalConsentAllowed",
        label: "Parental Consent Allowed",
        inputType: "toggle",
        showWhen: (fields) => fields.minimumAge === "16+",
      },
    ],
    defaultBody: `All clients must present a valid, government-issued photo ID at the time of their appointment. Acceptable forms of identification include:
- Driver's license or state ID
- Passport
- Military ID

The name on your ID must match the name on your booking. Expired IDs are not accepted.

We strictly enforce age requirements in compliance with local and state regulations. No exceptions will be made regardless of circumstance.

If parental consent is accepted at this studio, a parent or legal guardian must be physically present with their own valid ID and must sign all consent forms. Notarized letters are not accepted as a substitute for in-person parental presence.`,
  },

  "consent-waiver": {
    id: "consent-waiver",
    title: "Consent & Waiver",
    cardLabel: "Consent",
    structuredFields: [],
    defaultBody: `By receiving a tattoo at our studio, you acknowledge and agree to the following:

- Tattooing involves the use of needles and the insertion of pigment into the skin, which carries inherent risks including but not limited to infection, allergic reaction, scarring, and dissatisfaction with the result
- You are not under the influence of alcohol or drugs at the time of your appointment
- You have disclosed any medical conditions, medications, or allergies that may affect the tattooing process or healing
- You understand that tattoos are permanent and that while removal procedures exist, they are costly, painful, and may not fully remove the tattoo
- You have reviewed and approved your tattoo design, placement, and size prior to the procedure beginning
- You agree to follow all aftercare instructions provided by your artist
- You release the studio and artist from liability for any dissatisfaction with the artistic result, provided the agreed-upon design was executed as approved

A consent form must be signed in-studio before any tattoo work begins. Refusal to sign the consent form will result in cancellation of the appointment.`,
  },

  "health-safety": {
    id: "health-safety",
    title: "Health & Safety",
    cardLabel: "Health & Safety",
    structuredFields: [],
    defaultBody: `Your health and safety are our top priority. Our studio maintains the highest standards of cleanliness and sterilization.

Equipment and sterilization:
- All needles are single-use, pre-sterilized, and disposed of immediately after each session in approved sharps containers
- All reusable equipment is sterilized using hospital-grade autoclaves
- Spore testing is performed regularly to verify autoclave effectiveness
- Work surfaces are cleaned and barrier-protected between each client
- All pigments are poured into single-use cups and disposed of after each session

Artist certifications:
- All artists maintain current bloodborne pathogen training (OSHA compliant)
- All artists hold valid tattoo licenses as required by local regulations
- First aid supplies are readily available in the studio

Studio standards:
- Our studio is inspected and licensed by the local health department
- We maintain detailed records of all sterilization procedures
- Clients with open wounds, sunburns, or active skin conditions on the tattoo area will be rescheduled

If you have questions about our health and safety practices, please ask. We are happy to show you our sterilization process and certifications.`,
  },

  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    cardLabel: "Privacy",
    structuredFields: [],
    defaultBody: `We respect your privacy and are committed to protecting your personal information. This policy describes how we collect, use, and safeguard your data.

Information we collect:
- Contact information (name, email, phone number) provided during booking
- Payment information processed securely through our payment provider
- Photos of completed tattoo work (with your consent) for portfolio use
- Health information disclosed on consent forms, used solely for safety purposes

How we use your information:
- To confirm and manage your appointments
- To communicate about your booking, aftercare, and follow-ups
- To process payments securely
- To showcase our work (portfolio photos, with your consent only)

We do not sell, rent, or share your personal information with third parties for marketing purposes. Your health information is kept strictly confidential and is only accessible to your artist and studio management.

Payment processing is handled by our secure payment provider. We do not store credit card numbers on our systems.

You may request to view, update, or delete your personal information at any time by contacting us directly. Portfolio photos can be removed upon request.`,
  },

  terms: {
    id: "terms",
    title: "Terms of Service",
    cardLabel: "Terms",
    structuredFields: [],
    defaultBody: `By booking an appointment or receiving services at our studio, you agree to the following terms.

Appointments and scheduling:
- All appointments require a deposit as outlined in our Booking & Deposit Policy
- Appointment times are estimates; actual session duration may vary based on complexity
- Walk-ins are accepted subject to artist availability
- We reserve the right to refuse service to anyone

Intellectual property:
- Custom tattoo designs created by our artists remain the intellectual property of the studio
- You may not reproduce, distribute, or use custom designs for commercial purposes without written permission
- Reference images provided by clients are used for inspiration; final designs are original interpretations by the artist

Pricing:
- Tattoo pricing is based on size, complexity, placement, and time required
- Quotes provided during consultations are estimates and may be adjusted
- Final pricing is confirmed before the session begins
- Payment is due in full upon completion of each session

Liability:
- The studio is not responsible for tattoo fading, distortion, or color changes resulting from normal aging, sun exposure, or improper aftercare
- Any disputes regarding tattoo quality must be raised within 14 days of the session
- Our liability is limited to providing touch-up work at no additional cost within the stated touch-up window

These terms are subject to change. The current version is always available on our website.`,
  },
};

export const standardPolicyOrder: StandardPolicyId[] = [
  "booking-deposit",
  "cancellation-refund",
  "aftercare",
  "age-id",
  "consent-waiver",
  "health-safety",
  "privacy",
  "terms",
];

export function createDefaultPolicies(): PolicyConfig[] {
  return standardPolicyOrder.map((id, index) => {
    const def = standardPolicies[id];
    return {
      id,
      type: "standard" as const,
      title: def.title,
      enabled: true,
      body: def.defaultBody,
      structuredFields: {},
      featured: def.structuredFields.length > 0,
      order: index,
    };
  });
}
