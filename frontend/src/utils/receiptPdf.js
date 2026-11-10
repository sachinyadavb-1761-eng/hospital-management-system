// src/utils/receiptPdf.js
// Builds a printable payment receipt (A4 PDF) in the browser using jsPDF.
// Note: jsPDF's built-in fonts have no ₹ glyph, so the PDF uses "Rs." instead.

// jsPDF is loaded on demand (dynamic import) so it doesn't bloat the main bundle.

const NAVY = [15, 23, 42];
const TEAL = [15, 118, 110];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];

function formatDate(value, withWeekday = false) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", {
    ...(withWeekday ? { weekday: "long" } : {}),
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  const d = value ? new Date(value) : new Date();
  return `${formatDate(d)}, ${d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatAmount(amount) {
  const n = Number(amount) || 0;
  return `Rs. ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * receipt: {
 *   appointmentId, patientName, doctorName, department,
 *   date, time, fee, paymentId, orderId, paidAt
 * }
 */
export async function downloadReceiptPDF(receipt) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;

  const shortId = receipt.appointmentId
    ? `#${String(receipt.appointmentId).slice(-8).toUpperCase()}`
    : "-";

  // ── Header band ────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("MediCore", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text("Hospital Management System", margin, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("PAYMENT RECEIPT", pageW - margin, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`Receipt No: ${shortId}`, pageW - margin, 25, { align: "right" });

  // ── PAID badge ─────────────────────────────────────────────────
  let y = 52;
  doc.setFillColor(209, 250, 229);
  doc.roundedRect(margin, y - 7, 30, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(6, 95, 70);
  doc.text("PAID", margin + 15, y - 0.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(
    `Paid on ${formatDateTime(receipt.paidAt)}`,
    pageW - margin,
    y - 0.5,
    {
      align: "right",
    },
  );

  // ── Section helper ─────────────────────────────────────────────
  const section = (title, rows) => {
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...TEAL);
    doc.text(title.toUpperCase(), margin, y);
    y += 2.5;
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 12, y);

    rows.forEach(([label, value]) => {
      y += 9;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(label, margin, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      const text = doc.splitTextToSize(String(value ?? "-"), contentW - 55);
      doc.text(text, margin + 55, y);
      if (text.length > 1) y += (text.length - 1) * 5;

      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 2.5, pageW - margin, y + 2.5);
    });
  };

  section("Patient", [["Patient Name", receipt.patientName || "-"]]);

  section("Appointment", [
    ["Appointment ID", shortId],
    ["Doctor", receipt.doctorName || "-"],
    ["Department", receipt.department || "-"],
    ["Date", formatDate(receipt.date, true)],
    ["Time", receipt.time || "-"],
  ]);

  section("Payment", [
    ["Payment ID", receipt.paymentId || "-"],
    ["Order ID", receipt.orderId || "-"],
    ["Payment Mode", "Online (Razorpay)"],
    ["Status", "Paid"],
  ]);

  // ── Amount box ─────────────────────────────────────────────────
  y += 16;
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text("Consultation Fee Paid", margin + 6, y + 11.5);
  doc.setFontSize(16);
  doc.setTextColor(...TEAL);
  doc.text(formatAmount(receipt.fee), pageW - margin - 6, y + 11.7, {
    align: "right",
  });

  // ── Footer ─────────────────────────────────────────────────────
  y += 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(146, 64, 14);
  doc.text("Please arrive 10 minutes before your appointment time.", margin, y);
  doc.setTextColor(...MUTED);
  doc.text(
    "Please carry a printed copy of this receipt to the hospital.",
    margin,
    y + 6,
  );

  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(margin, pageH - 22, pageW - margin, pageH - 22);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    pageW / 2,
    pageH - 15,
    { align: "center" },
  );

  doc.save(`MediCore-Receipt-${shortId.replace("#", "")}.pdf`);
}

// Builds the receipt object from a saved appointment (used in "My Appointments").
export function receiptFromAppointment(appt, patientName) {
  return {
    appointmentId: appt._id,
    patientName,
    doctorName: appt.doctor?.name,
    department: appt.doctor?.department?.name || appt.doctor?.specialization,
    date: appt.date,
    time: appt.time,
    fee: appt.fee || appt.doctor?.fee || 0,
    paymentId: appt.paymentId,
    orderId: appt.orderId,
    paidAt: appt.updatedAt,
  };
}
