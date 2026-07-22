"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCustomerDesignBriefs,
  getCustomerHealedPhotos,
  getCustomerInvoices,
  getCustomerReviews,
} from "@/lib/data/customer-dashboard";
import { fetchInbox } from "@/app/messages/actions";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCustomerAppointments,
  fetchCustomerRequests,
} from "@/lib/data/supabase-booking";
import {
  appointmentToViewModel,
  requestToViewModel,
} from "@/lib/supabase/booking-types";
import type { AppointmentRecord, BookingRequestRecord } from "@/lib/types/booking";
import type { InboxConversation } from "@/lib/types/messaging";
import type { DesignBrief, HealedPhoto, Invoice, Review } from "@/lib/types";

const byDateAsc = (a: { date: string | Date }, b: { date: string | Date }) =>
  new Date(a.date).getTime() - new Date(b.date).getTime();
const byDateDesc = (a: { date: string | Date }, b: { date: string | Date }) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();
const byMessagedDesc = (a: InboxConversation, b: InboxConversation) =>
  Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt);
const byCreatedDesc = (a: Invoice, b: Invoice) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function useCustomerData(userId: string | undefined) {
  // Live conversations + booking data (requests + appointments); the rest is still mock.
  const [conversations, setConversations] = useState<InboxConversation[] | null>(null);
  const [appointmentRecords, setAppointmentRecords] = useState<AppointmentRecord[]>([]);
  const [requestRecords, setRequestRecords] = useState<BookingRequestRecord[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void fetchInbox().then((res) => {
      if (!cancelled) setConversations(res.ok ? res.conversations : []);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refreshBooking = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    const [appts, reqs] = await Promise.all([
      fetchCustomerAppointments(supabase, userId),
      fetchCustomerRequests(supabase, userId),
    ]);
    setAppointmentRecords(appts);
    setRequestRecords(reqs);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const supabase = createClient();
    void Promise.all([
      fetchCustomerAppointments(supabase, userId),
      fetchCustomerRequests(supabase, userId),
    ]).then(([appts, reqs]) => {
      if (cancelled) return;
      setAppointmentRecords(appts);
      setRequestRecords(reqs);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const appointments = useMemo(
    () => appointmentRecords.map(appointmentToViewModel),
    [appointmentRecords]
  );
  const bookingRequests = useMemo(() => requestRecords.map(requestToViewModel), [requestRecords]);
  const scheduledRequestIds = useMemo(
    () => new Set(appointmentRecords.map((a) => a.requestId).filter((id): id is string => Boolean(id))),
    [appointmentRecords]
  );

  const [invoices] = useState<Invoice[]>(getCustomerInvoices);
  const [reviews] = useState<Review[]>(getCustomerReviews);
  const [designBriefs] = useState<DesignBrief[]>(getCustomerDesignBriefs);
  const [healedPhotos] = useState<HealedPhoto[]>(getCustomerHealedPhotos);

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.status === "confirmed" || a.status === "pending").sort(byDateAsc),
    [appointments]
  );

  const pastAppointments = useMemo(
    () => appointments.filter((a) => a.status === "completed" || a.status === "cancelled").sort(byDateDesc),
    [appointments]
  );

  const completedAppointments = useMemo(
    () => pastAppointments.filter((a) => a.status === "completed"),
    [pastAppointments]
  );

  const completedWithoutReview = useMemo(() => {
    const reviewedIds = new Set(reviews.map((r) => r.targetId));
    return completedAppointments.filter((a) => !reviewedIds.has(a.artistId));
  }, [completedAppointments, reviews]);

  const sortedConversations = useMemo(
    () => (conversations ? [...conversations].sort(byMessagedDesc) : null),
    [conversations]
  );

  const sortedInvoices = useMemo(
    () => [...invoices].sort(byCreatedDesc),
    [invoices]
  );

  const unreadCount = useMemo(
    () => (conversations ?? []).reduce((sum, c) => sum + c.unread, 0),
    [conversations]
  );

  const pendingBookings = useMemo(
    () => bookingRequests.filter((r) => r.status === "pending").length,
    [bookingRequests]
  );

  const unpaidInvoices = useMemo(
    () => invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").length,
    [invoices]
  );

  const nextAppointment = upcomingAppointments[0] ?? null;

  return {
    conversations,
    sortedConversations,
    appointments,
    appointmentRecords,
    requestRecords,
    scheduledRequestIds,
    refreshBooking,
    upcomingAppointments,
    pastAppointments,
    completedAppointments,
    completedWithoutReview,
    bookingRequests,
    invoices,
    sortedInvoices,
    reviews,
    designBriefs,
    healedPhotos,
    unreadCount,
    pendingBookings,
    unpaidInvoices,
    nextAppointment,
  };
}
