import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface InvoicePDFData {
  invoiceNumber: string;
  issueDate: string | Date;
  dueDate: string | Date;
  status: string;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  notes?: string | null;
  customer: {
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
    billingAddress?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number | string;
    amount: number | string;
  }>;
}

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [37, 99, 235]; // #2563EB
  const darkColor = [21, 21, 21]; // #151515
  const greyColor = [100, 116, 139]; // Slate 500

  // 1. Header: Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("BILLORA", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("Subscription Billing & Management SaaS", 14, 25);
  doc.text("support@billora.com | www.billora.com", 14, 30);

  // 2. Invoice Details (Right-aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("INVOICE", 196, 20, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`#${data.invoiceNumber}`, 196, 26, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(
    `Status: ${data.status.toUpperCase()}`,
    196,
    31,
    { align: "right" }
  );

  // Separator Line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // 3. Customer & Billing Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("BILLED TO:", 14, 43);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.customer.name, 14, 49);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);

  let y = 54;
  if (data.customer.company) {
    doc.text(data.customer.company, 14, y);
    y += 4.5;
  }
  doc.text(data.customer.email, 14, y);
  y += 4.5;

  if (data.customer.billingAddress) {
    doc.text(data.customer.billingAddress, 14, y);
    y += 4.5;
  }
  const location = [
    data.customer.city,
    data.customer.state,
    data.customer.country,
  ]
    .filter(Boolean)
    .join(", ");
  if (location) {
    doc.text(location, 14, y);
    y += 4.5;
  }

  // Invoice Dates (Right Column)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Issue Date:", 140, 43);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(format(new Date(data.issueDate), "MMMM d, yyyy"), 196, 43, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Due Date:", 140, 49);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(format(new Date(data.dueDate), "MMMM d, yyyy"), 196, 49, {
    align: "right",
  });

  // 4. Line Items Table using jspdf-autotable
  const tableRows = data.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toString(),
    `$${Number(item.unitPrice).toFixed(2)}`,
    `$${Number(item.amount).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: Math.max(y + 6, 68),
    head: [["#", "Item Description", "Qty", "Unit Price", "Total"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [21, 21, 21],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 90 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    styles: {
      cellPadding: 3,
    },
  });

  // 5. Financial Summary / Totals
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Notes on left
  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Notes / Remarks:", 14, finalY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    const splitNotes = doc.splitTextToSize(data.notes, 90);
    doc.text(splitNotes, 14, finalY + 5);
  }

  // Summary on right
  const summaryX = 135;
  const valueX = 196;
  let summaryY = finalY;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("Subtotal:", summaryX, summaryY);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`$${Number(data.subtotal).toFixed(2)}`, valueX, summaryY, {
    align: "right",
  });

  if (Number(data.discount) > 0) {
    summaryY += 5;
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.text("Discount:", summaryX, summaryY);
    doc.setTextColor(220, 38, 38);
    doc.text(`-$${Number(data.discount).toFixed(2)}`, valueX, summaryY, {
      align: "right",
    });
  }

  if (Number(data.tax) > 0) {
    summaryY += 5;
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.text("Tax / VAT:", summaryX, summaryY);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`+$${Number(data.tax).toFixed(2)}`, valueX, summaryY, {
      align: "right",
    });
  }

  // Grand Total box
  summaryY += 7;
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX - 4, summaryY - 4.5, 65, 10, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Grand Total:", summaryX, summaryY + 2);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`$${Number(data.total).toFixed(2)}`, valueX, summaryY + 2, {
    align: "right",
  });

  // Footer note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(
    "Thank you for choosing Billora. For any billing queries, contact support@billora.com",
    105,
    285,
    { align: "center" }
  );

  return doc;
}
