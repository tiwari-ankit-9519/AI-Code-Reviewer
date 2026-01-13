// lib/actions/support-tickets.ts

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkPrioritySupport } from "@/lib/services/priority-support-service";
import {
  sendTicketCreatedEmail,
  sendTicketResponseEmail,
} from "@/lib/email/support-emails";
import { SupportCategory, TicketPriority } from "@prisma/client";

export async function createSupportTicket(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const subject = formData.get("subject") as string;
  const category = formData.get("category") as string;
  const message = formData.get("message") as string;

  if (!subject || !category || !message) {
    throw new Error("All fields are required");
  }

  const supportStatus = await checkPrioritySupport(session.user.id);

  const priorityMap = {
    STARTER: "LOW",
    HERO: "MEDIUM",
    LEGEND: "HIGH",
  };

  const slaMap = {
    STARTER: 72,
    HERO: 24,
    LEGEND: 4,
  };

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      subject,
      category: category as SupportCategory,
      priority: priorityMap[supportStatus.tier] as TicketPriority,
      status: "OPEN",
      slaResponseTime: slaMap[supportStatus.tier],
      messages: {
        create: {
          senderId: session.user.id,
          isStaff: false,
          message,
        },
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          subscriptionTier: true,
        },
      },
      messages: true,
    },
  });

  await sendTicketCreatedEmail(ticket.id);

  revalidatePath("/dashboard/support");
  revalidatePath("/dashboard/support/tickets");

  return { success: true, ticketId: ticket.id };
}

export async function getUserTickets() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const tickets = await prisma.supportTicket.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tickets;
}

export async function getTicketById(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          subscriptionTier: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return ticket;
}

export async function addTicketMessage(ticketId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { userId: true, status: true },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (ticket.status === "CLOSED") {
    throw new Error("Cannot reply to closed ticket");
  }

  await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: session.user.id,
      isStaff: false,
      message,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: ticket.status === "WAITING_USER" ? "IN_PROGRESS" : ticket.status,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/support/tickets/${ticketId}`);

  return { success: true };
}

export async function closeTicket(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { userId: true },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/support");
  revalidatePath("/dashboard/support/tickets");
  revalidatePath(`/dashboard/support/tickets/${ticketId}`);

  return { success: true };
}

export async function getAllTicketsAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const tickets = await prisma.supportTicket.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          subscriptionTier: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return tickets;
}

export async function assignTicket(ticketId: string, adminId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      assignedTo: adminId,
      assignedAt: new Date(),
      status: "IN_PROGRESS",
    },
  });

  revalidatePath("/dashboard/admin/support");

  return { success: true };
}

export async function addStaffResponse(ticketId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { firstResponseAt: true, userId: true },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: session.user.id,
      isStaff: true,
      message,
    },
  });

  const updateData: {
    status: string;
    updatedAt: Date;
    firstResponseAt?: Date;
  } = {
    status: "WAITING_USER",
    updatedAt: new Date(),
  };

  if (!ticket.firstResponseAt) {
    updateData.firstResponseAt = new Date();
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "WAITING_USER",
      updatedAt: new Date(),
    },
  });

  await sendTicketResponseEmail(ticketId);

  revalidatePath("/dashboard/admin/support");
  revalidatePath(`/dashboard/admin/support/${ticketId}`);

  return { success: true };
}

export async function resolveTicket(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/admin/support");

  return { success: true };
}
