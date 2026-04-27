import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { StockItem, StockHistory } from '../types'

interface DebtorPdfRow {
  debtorCode?: string
  name: string
  phone?: string
  plate?: string
  invoiceCount: number
  totalOwed: number
  oldestDueDate?: string
  daysOverdue: number
}

const COMPANY = {
  name: 'DREAM GARAGE (M) SDN BHD',
  address: '22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor',
  phone: '+60 18-207 8080',
}

function addHeader(doc: jsPDF) {
  doc.setFillColor(17, 18, 23)
  doc.rect(0, 0, doc.internal.pageSize.width, 28, 'F')
  doc.setTextColor(255, 215, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY.name, 14, 12)
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(COMPANY.address, 14, 18)
  doc.text(`Tel: ${COMPANY.phone}`, 14, 23)
  doc.setTextColor(0, 0, 0)
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-MY')} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: 'center' }
    )
  }
}

export function exportStockListPdf(items: StockItem[]) {
  const doc = new jsPDF()
  addHeader(doc)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Stock Inventory Report', 14, 38)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Total items: ${items.length}`, 14, 44)
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 50,
    head: [['Item Code', 'Description', 'Category', 'UOM', 'Cost (RM)', 'Price (RM)', 'Qty']],
    body: items.map((i) => [
      i.itemCode,
      i.description,
      i.category?.name || '—',
      i.uom,
      Number(i.costPrice).toFixed(2),
      Number(i.sellPrice).toFixed(2),
      String(i.quantity),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [17, 18, 23], textColor: [255, 215, 0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
  })

  addFooter(doc)
  doc.save('stock-inventory.pdf')
}

export function exportDebtorListPdf(debtors: DebtorPdfRow[], grandTotal: number) {
  const doc = new jsPDF()
  addHeader(doc)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Debtors Report', 14, 38)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`${debtors.length} debtor${debtors.length !== 1 ? 's' : ''}  |  Total Outstanding: RM ${grandTotal.toFixed(2)}`, 14, 44)
  doc.text(`Printed: ${new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 49)
  doc.setTextColor(0)

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  autoTable(doc, {
    startY: 55,
    head: [['Code', 'Customer', 'Phone', 'Vehicle', 'Invoices', 'Due Date', 'Overdue', 'Outstanding (RM)']],
    body: debtors.map((d) => [
      d.debtorCode || '—',
      d.name,
      d.phone || '—',
      d.plate || '—',
      String(d.invoiceCount),
      fmtDate(d.oldestDueDate),
      d.daysOverdue > 0 ? `${d.daysOverdue}d` : '—',
      d.totalOwed.toFixed(2),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [17, 18, 23], textColor: [255, 215, 0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      4: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 6) {
        const raw = data.cell.raw as string
        if (raw !== '—') {
          const days = parseInt(raw)
          if (days > 30) data.cell.styles.textColor = [220, 38, 38]
          else if (days > 7) data.cell.styles.textColor = [202, 138, 4]
        }
      }
      if (data.section === 'body' && data.column.index === 7) {
        data.cell.styles.textColor = [220, 38, 38]
      }
    },
  })

  addFooter(doc)
  doc.save('debtors-report.pdf')
}

export function exportStockHistoryPdf(itemCode: string, description: string, records: StockHistory[]) {
  const doc = new jsPDF()
  addHeader(doc)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Stock Movement History', 14, 38)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${itemCode} — ${description}`, 14, 44)
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text(`Total records: ${records.length}`, 14, 50)
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 56,
    head: [['Date', 'Type', 'Qty', 'Before', 'After', 'Reason', 'By']],
    body: records.map((r) => [
      new Date(r.createdAt).toLocaleString('en-MY'),
      r.type,
      String(r.quantity),
      String(r.previousQty),
      String(r.newQty),
      r.reason,
      r.createdBy?.name || '—',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [17, 18, 23], textColor: [255, 215, 0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = data.cell.raw
        if (val === 'IN') data.cell.styles.textColor = [22, 163, 74]
        else if (val === 'OUT') data.cell.styles.textColor = [220, 38, 38]
        else data.cell.styles.textColor = [100, 100, 100]
      }
    },
  })

  addFooter(doc)
  doc.save(`stock-history-${itemCode}.pdf`)
}
