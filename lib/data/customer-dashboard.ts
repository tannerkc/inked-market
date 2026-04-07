import type {
  Conversation,
  Appointment,
  BookingRequest,
  Invoice,
  Review,
  DesignBrief,
  AftercareTimeline,
  HealedPhoto,
  ConversationParticipant,
} from "@/lib/types";

// Helper to create dates relative to now
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

export function getCustomerConversations(): Conversation[] {
  return [
    {
      id: "conv-1",
      participantIds: ["customer-1", "artist-1"],
      lastMessageAt: daysAgo(0),
      lastMessage: "Hey! I finished the sketch for your sleeve piece. Take a look and let me know your thoughts.",
      unreadCount: { "customer-1": 2 },
      createdAt: daysAgo(5),
      updatedAt: daysAgo(0),
    },
    {
      id: "conv-2",
      participantIds: ["customer-1", "studio-1"],
      lastMessageAt: daysAgo(1),
      lastMessage: "Your appointment is confirmed for next Thursday at 2pm. See you then!",
      unreadCount: { "customer-1": 1 },
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
    },
    {
      id: "conv-3",
      participantIds: ["customer-1", "artist-2"],
      lastMessageAt: daysAgo(3),
      lastMessage: "Thanks for sending the reference photos. I'll put together some ideas this week.",
      unreadCount: { "customer-1": 0 },
      createdAt: daysAgo(7),
      updatedAt: daysAgo(3),
    },
  ];
}

export function getCustomerAppointments(): Appointment[] {
  return [
    {
      id: "appt-1",
      customerId: "customer-1",
      artistId: "artist-1",
      artistName: "Sarah Chen",
      studioId: "studio-1",
      studioName: "Iron Rose Tattoo",
      date: daysFromNow(8),
      duration: 180,
      status: "confirmed",
      notes: "Geometric sleeve session 2 of 3",
      createdAt: daysAgo(14),
      updatedAt: daysAgo(1),
    },
    {
      id: "appt-2",
      customerId: "customer-1",
      artistId: "artist-2",
      artistName: "Marcus Rivera",
      studioName: "Black Anchor Tattoo",
      date: daysFromNow(21),
      duration: 120,
      status: "pending",
      notes: "Traditional eagle chest piece — first session",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: "appt-3",
      customerId: "customer-1",
      artistId: "artist-1",
      artistName: "Sarah Chen",
      studioId: "studio-1",
      studioName: "Iron Rose Tattoo",
      date: daysAgo(30),
      duration: 180,
      status: "completed",
      invoiceId: "inv-1",
      notes: "Geometric sleeve session 1 of 3",
      createdAt: daysAgo(45),
      updatedAt: daysAgo(30),
    },
    {
      id: "appt-4",
      customerId: "customer-1",
      artistId: "artist-3",
      artistName: "Yuki Tanaka",
      studioName: "Silk City Ink",
      date: daysAgo(90),
      duration: 60,
      status: "completed",
      invoiceId: "inv-2",
      notes: "Fine line botanical forearm piece",
      createdAt: daysAgo(100),
      updatedAt: daysAgo(90),
    },
    {
      id: "appt-5",
      customerId: "customer-1",
      artistId: "artist-4",
      artistName: "Jade Williams",
      date: daysAgo(60),
      duration: 90,
      status: "cancelled",
      notes: "Watercolor shoulder piece — cancelled by artist",
      createdAt: daysAgo(75),
      updatedAt: daysAgo(62),
    },
  ];
}

export function getCustomerBookingRequests(): BookingRequest[] {
  return [
    {
      id: "req-1",
      customerId: "customer-1",
      artistId: "artist-5",
      artistName: "Dev Patel",
      studioName: "Desert Sun Studio",
      requestedDate: daysFromNow(30),
      flexibleDates: true,
      status: "pending",
      summary: "Dotwork mandala back piece — looking for a full-day session",
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "req-2",
      customerId: "customer-1",
      artistId: "artist-2",
      artistName: "Marcus Rivera",
      studioName: "Black Anchor Tattoo",
      requestedDate: daysFromNow(21),
      status: "accepted",
      designBriefId: "brief-1",
      summary: "Traditional eagle chest piece",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(3),
    },
    {
      id: "req-3",
      customerId: "customer-1",
      artistId: "artist-6",
      artistName: "Luna Park",
      status: "declined",
      summary: "Neo-traditional portrait — artist fully booked through summer",
      createdAt: daysAgo(20),
      updatedAt: daysAgo(18),
    },
  ];
}

export function getCustomerInvoices(): Invoice[] {
  return [
    {
      id: "inv-1",
      customerId: "customer-1",
      artistId: "artist-1",
      artistName: "Sarah Chen",
      appointmentId: "appt-3",
      amount: 450,
      currency: "USD",
      status: "paid",
      paidAt: daysAgo(30),
      description: "Geometric sleeve session 1 — 3hr session",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
    {
      id: "inv-2",
      customerId: "customer-1",
      artistId: "artist-3",
      artistName: "Yuki Tanaka",
      appointmentId: "appt-4",
      amount: 200,
      currency: "USD",
      status: "paid",
      paidAt: daysAgo(90),
      description: "Fine line botanical — 1hr session",
      createdAt: daysAgo(90),
      updatedAt: daysAgo(90),
    },
    {
      id: "inv-3",
      customerId: "customer-1",
      artistId: "artist-1",
      artistName: "Sarah Chen",
      amount: 75,
      currency: "USD",
      status: "unpaid",
      dueDate: daysFromNow(5),
      description: "Deposit — Geometric sleeve session 2",
      createdAt: daysAgo(7),
      updatedAt: daysAgo(7),
    },
  ];
}

export function getCustomerReviews(): Review[] {
  return [
    {
      id: "review-1",
      authorId: "customer-1",
      authorName: "Alex Morgan",
      targetId: "artist-3",
      targetType: "artist",
      rating: 5,
      title: "Absolutely stunning fine line work",
      content: "Yuki's attention to detail is incredible. The botanical piece healed perfectly and looks even better than the day I got it. Highly recommend for any fine line work.",
      verified: true,
      createdAt: daysAgo(80),
      updatedAt: daysAgo(80),
    },
  ];
}

export function getCustomerDesignBriefs(): DesignBrief[] {
  return [
    {
      id: "brief-1",
      customerId: "customer-1",
      artistId: "artist-2",
      artistName: "Marcus Rivera",
      placement: "Chest",
      size: "Large (8-12 inches)",
      budget: { min: 400, max: 800 },
      description: "Traditional American eagle with banner. Centered on chest, wings spread. Classic bold lines and limited color palette — red, blue, gold.",
      referenceImages: [],
      notes: "Open to artist interpretation on banner text. Prefer classic Sailor Jerry style.",
      status: "accepted",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(5),
    },
    {
      id: "brief-2",
      customerId: "customer-1",
      artistId: "artist-5",
      artistName: "Dev Patel",
      placement: "Upper back",
      size: "Extra large (12+ inches)",
      budget: { min: 800, max: 1500 },
      description: "Dotwork mandala with geometric patterns radiating outward. Blackwork only, no color.",
      referenceImages: [],
      status: "submitted",
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "brief-3",
      customerId: "customer-1",
      placement: "Forearm",
      size: "Medium (4-8 inches)",
      description: "Minimalist mountain range with moon phase. Single needle style.",
      referenceImages: [],
      status: "draft",
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];
}

export function getCustomerAftercare(): AftercareTimeline[] {
  return [
    {
      id: "aftercare-1",
      appointmentId: "appt-3",
      artistId: "artist-1",
      artistName: "Sarah Chen",
      startDate: daysAgo(30),
      steps: [
        {
          id: "step-1",
          day: 0,
          title: "Remove bandage",
          instructions: "Remove the bandage after 2-4 hours. Gently wash with lukewarm water and unscented soap.",
          completed: true,
          completedAt: daysAgo(30),
        },
        {
          id: "step-2",
          day: 1,
          title: "First wash & moisturize",
          instructions: "Wash 2-3 times daily with unscented soap. Apply a thin layer of unscented moisturizer.",
          completed: true,
          completedAt: daysAgo(29),
        },
        {
          id: "step-3",
          day: 3,
          title: "Peeling begins",
          instructions: "Do NOT pick or scratch. Let skin flake naturally. Continue moisturizing.",
          completed: true,
          completedAt: daysAgo(27),
        },
        {
          id: "step-4",
          day: 7,
          title: "One week check",
          instructions: "Tattoo should be mostly healed on the surface. Continue moisturizing. Avoid sun exposure.",
          completed: true,
          completedAt: daysAgo(23),
        },
        {
          id: "step-5",
          day: 14,
          title: "Two week milestone",
          instructions: "Surface should be fully healed. Deep layers still healing. Avoid swimming and direct sunlight.",
          completed: true,
          completedAt: daysAgo(16),
        },
        {
          id: "step-6",
          day: 30,
          title: "Fully healed",
          instructions: "Your tattoo should be completely healed! Consider uploading a healed photo for your artist.",
          completed: true,
          completedAt: daysAgo(0),
        },
      ],
      customNotes: "Use Aquaphor for the first 3 days, then switch to unscented lotion. Avoid tight clothing over the area.",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(0),
    },
  ];
}

export function getCustomerHealedPhotos(): HealedPhoto[] {
  return [
    {
      id: "healed-1",
      customerId: "customer-1",
      appointmentId: "appt-4",
      artistId: "artist-3",
      url: "",
      caption: "Healed botanical piece — 3 months later",
      approvedForPortfolio: true,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(60),
    },
  ];
}

export function getConversationParticipants(): Record<string, ConversationParticipant> {
  return {
    "artist-1": {
      id: "artist-1",
      name: "Sarah Chen",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      role: "artist",
    },
    "studio-1": {
      id: "studio-1",
      name: "Iron Rose Tattoo",
      avatarUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200",
      role: "studio",
    },
    "artist-2": {
      id: "artist-2",
      name: "Marcus Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      role: "artist",
    },
  };
}
