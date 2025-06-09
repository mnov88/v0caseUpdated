import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import jsPDF from "jspdf"
import "jspdf-autotable"

export interface ExportData {
  title: string
  subtitle?: string
  cases: Array<{
    id: string
    case_id_text: string
    title: string
    court: string
    date_of_judgment: string
    parties: string
    operative_parts?: Array<{
      id: string
      part_number: number
      verbatim_text: string
      simplified_text: string
    }>
  }>
  showSimplified: boolean
  filters?: {
    dateFrom?: string
    dateTo?: string
    court?: string
  }
}

export interface ExportProgress {
  progress: number
  message: string
  stage: "preparing" | "processing" | "generating" | "complete" | "error"
}

export class ExportManager {
  private onProgress?: (progress: ExportProgress) => void
  private cancelled = false

  constructor(onProgress?: (progress: ExportProgress) => void) {
    this.onProgress = onProgress
  }

  cancel() {
    this.cancelled = true
  }

  private updateProgress(progress: number, message: string, stage: ExportProgress["stage"] = "processing") {
    if (this.onProgress && !this.cancelled) {
      this.onProgress({ progress, message, stage })
    }
  }

  async exportToCSV(data: ExportData): Promise<void> {
    try {
      this.updateProgress(0, "Preparing CSV export...", "preparing")

      if (this.cancelled) return

      const headers = ["Case ID", "Title", "Court", "Date", "Parties", "Operative Parts"]

      this.updateProgress(20, "Processing case data...", "processing")

      const rows = data.cases.map((caseItem, index) => {
        if (this.cancelled) return []

        // Update progress for each case
        if (index % 10 === 0) {
          this.updateProgress(
            20 + (index / data.cases.length) * 60,
            `Processing case ${index + 1} of ${data.cases.length}...`,
          )
        }

        return [
          caseItem.case_id_text,
          caseItem.title,
          caseItem.court,
          caseItem.date_of_judgment,
          caseItem.parties,
          caseItem.operative_parts
            ?.map((op) => (data.showSimplified ? op.simplified_text : op.verbatim_text))
            .join(" | ") || "",
        ]
      })

      if (this.cancelled) return

      this.updateProgress(80, "Generating CSV file...", "generating")

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell?.replace(/"/g, '""') || ""}"`).join(","))
        .join("\n")

      this.updateProgress(90, "Downloading file...")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `eu-law-report-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)

      this.updateProgress(100, "Export complete!", "complete")
    } catch (error) {
      console.error("CSV export error:", error)
      this.updateProgress(100, "Export failed", "error")
      throw error
    }
  }

  async exportToHTML(data: ExportData): Promise<void> {
    try {
      this.updateProgress(0, "Preparing HTML export...", "preparing")

      if (this.cancelled) return

      this.updateProgress(20, "Generating HTML content...", "processing")

      const filterInfo = data.filters
        ? `
        <div class="filters">
          <h3>Applied Filters:</h3>
          <ul>
            ${data.filters.dateFrom ? `<li><strong>Date From:</strong> ${data.filters.dateFrom}</li>` : ""}
            ${data.filters.dateTo ? `<li><strong>Date To:</strong> ${data.filters.dateTo}</li>` : ""}
            ${data.filters.court ? `<li><strong>Court:</strong> ${data.filters.court}</li>` : ""}
          </ul>
        </div>
        `
        : ""

      let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #f8f9fa;
              color: #333;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              background: white; 
              padding: 30px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
              color: #2563eb; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .subtitle { 
              color: #6b7280; 
              font-size: 1.1em; 
              margin-bottom: 30px; 
            }
            .filters {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 30px;
            }
            .filters h3 {
              margin-top: 0;
              color: #374151;
            }
            .filters ul {
              margin: 10px 0 0 0;
              padding-left: 20px;
            }
            .case-card { 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              margin-bottom: 25px; 
              overflow: hidden;
              transition: box-shadow 0.2s;
            }
            .case-card:hover {
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .case-header { 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
              padding: 20px; 
              border-bottom: 1px solid #e5e7eb;
            }
            .case-id { 
              font-weight: bold; 
              color: #1e40af; 
              font-size: 1.1em;
              margin-bottom: 8px;
            }
            .case-title { 
              font-size: 1.2em; 
              font-weight: 600; 
              margin-bottom: 10px; 
              color: #111827;
            }
            .case-meta { 
              display: flex; 
              gap: 20px; 
              font-size: 0.9em; 
              color: #6b7280; 
              flex-wrap: wrap;
            }
            .case-content { 
              padding: 20px; 
            }
            .parties { 
              background-color: #fef3c7; 
              padding: 12px; 
              border-radius: 6px; 
              margin-bottom: 20px; 
              border-left: 4px solid #f59e0b;
            }
            .operative-parts { 
              margin-top: 20px; 
            }
            .operative-part { 
              background-color: #f0f9ff; 
              border: 1px solid #bae6fd; 
              border-radius: 6px; 
              padding: 15px; 
              margin-bottom: 15px; 
              position: relative;
            }
            .operative-part-header { 
              font-weight: bold; 
              color: #0369a1; 
              margin-bottom: 10px; 
              font-size: 0.9em;
            }
            .operative-part-text { 
              line-height: 1.6; 
              color: #374151;
            }
            .no-operative-parts { 
              color: #9ca3af; 
              font-style: italic; 
              text-align: center; 
              padding: 20px;
            }
            .export-info {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 0.9em;
            }
            @media print {
              body { background-color: white; }
              .container { box-shadow: none; }
              .case-card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${data.title}</h1>
            ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ""}
            ${filterInfo}
            <div class="cases">
      `

      this.updateProgress(40, "Processing cases...", "processing")

      data.cases.forEach((caseItem, index) => {
        if (this.cancelled) return

        if (index % 5 === 0) {
          this.updateProgress(
            40 + (index / data.cases.length) * 40,
            `Processing case ${index + 1} of ${data.cases.length}...`,
          )
        }

        htmlContent += `
          <div class="case-card">
            <div class="case-header">
              <div class="case-id">${caseItem.case_id_text}</div>
              <div class="case-title">${caseItem.title}</div>
              <div class="case-meta">
                <span><strong>Court:</strong> ${caseItem.court}</span>
                <span><strong>Date:</strong> ${caseItem.date_of_judgment}</span>
              </div>
            </div>
            <div class="case-content">
              ${caseItem.parties ? `<div class="parties"><strong>Parties:</strong> ${caseItem.parties}</div>` : ""}
              <div class="operative-parts">
                <h4>Operative Parts:</h4>
        `

        if (caseItem.operative_parts && caseItem.operative_parts.length > 0) {
          caseItem.operative_parts.forEach((part) => {
            htmlContent += `
              <div class="operative-part">
                <div class="operative-part-header">Part ${part.part_number}</div>
                <div class="operative-part-text">
                  ${data.showSimplified ? part.simplified_text : part.verbatim_text}
                </div>
              </div>
            `
          })
        } else {
          htmlContent += `<div class="no-operative-parts">No operative parts available</div>`
        }

        htmlContent += `
              </div>
            </div>
          </div>
        `
      })

      if (this.cancelled) return

      this.updateProgress(80, "Finalizing HTML...", "generating")

      htmlContent += `
            </div>
            <div class="export-info">
              <p>Report generated on ${new Date().toLocaleString()}</p>
              <p>Total cases: ${data.cases.length}</p>
              <p>Text format: ${data.showSimplified ? "Simplified" : "Full verbatim"}</p>
            </div>
          </div>
        </body>
        </html>
      `

      this.updateProgress(90, "Downloading file...")

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `eu-law-report-${Date.now()}.html`
      a.click()
      URL.revokeObjectURL(url)

      this.updateProgress(100, "Export complete!", "complete")
    } catch (error) {
      console.error("HTML export error:", error)
      this.updateProgress(100, "Export failed", "error")
      throw error
    }
  }

  async exportToWord(data: ExportData): Promise<void> {
    try {
      this.updateProgress(0, "Preparing Word document...", "preparing")

      if (this.cancelled) return

      this.updateProgress(20, "Creating document structure...", "processing")

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: data.title,
                heading: HeadingLevel.TITLE,
              }),
              ...(data.subtitle
                ? [
                    new Paragraph({
                      text: data.subtitle,
                      heading: HeadingLevel.HEADING_2,
                    }),
                  ]
                : []),
              new Paragraph({
                text: `Generated on: ${new Date().toLocaleDateString()}`,
              }),
              new Paragraph({
                text: `Total cases: ${data.cases.length}`,
              }),
              new Paragraph({
                text: `Text format: ${data.showSimplified ? "Simplified" : "Full verbatim"}`,
              }),
              new Paragraph({ text: "" }), // Empty line
            ],
          },
        ],
      })

      this.updateProgress(40, "Adding case data...", "processing")

      // Add cases to document
      const section = doc.getSections()[0]

      data.cases.forEach((caseItem, index) => {
        if (this.cancelled) return

        if (index % 3 === 0) {
          this.updateProgress(
            40 + (index / data.cases.length) * 40,
            `Adding case ${index + 1} of ${data.cases.length}...`,
          )
        }

        // Case header
        section.addChildElement(
          new Paragraph({
            text: caseItem.case_id_text,
            heading: HeadingLevel.HEADING_1,
          }),
        )

        section.addChildElement(
          new Paragraph({
            text: caseItem.title,
            heading: HeadingLevel.HEADING_2,
          }),
        )

        // Case metadata
        section.addChildElement(
          new Paragraph({
            children: [new TextRun({ text: "Court: ", bold: true }), new TextRun({ text: caseItem.court })],
          }),
        )

        section.addChildElement(
          new Paragraph({
            children: [new TextRun({ text: "Date: ", bold: true }), new TextRun({ text: caseItem.date_of_judgment })],
          }),
        )

        if (caseItem.parties) {
          section.addChildElement(
            new Paragraph({
              children: [new TextRun({ text: "Parties: ", bold: true }), new TextRun({ text: caseItem.parties })],
            }),
          )
        }

        // Operative parts
        if (caseItem.operative_parts && caseItem.operative_parts.length > 0) {
          section.addChildElement(
            new Paragraph({
              text: "Operative Parts:",
              heading: HeadingLevel.HEADING_3,
            }),
          )

          caseItem.operative_parts.forEach((part) => {
            section.addChildElement(
              new Paragraph({
                children: [
                  new TextRun({ text: `Part ${part.part_number}: `, bold: true }),
                  new TextRun({
                    text: data.showSimplified ? part.simplified_text : part.verbatim_text,
                  }),
                ],
              }),
            )
          })
        }

        section.addChildElement(new Paragraph({ text: "" })) // Empty line between cases
      })

      if (this.cancelled) return

      this.updateProgress(80, "Generating Word file...", "generating")

      const buffer = await Packer.toBuffer(doc)

      this.updateProgress(90, "Downloading file...")

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `eu-law-report-${Date.now()}.docx`
      a.click()
      URL.revokeObjectURL(url)

      this.updateProgress(100, "Export complete!", "complete")
    } catch (error) {
      console.error("Word export error:", error)
      this.updateProgress(100, "Export failed", "error")
      throw error
    }
  }

  async exportToPDF(data: ExportData): Promise<void> {
    try {
      this.updateProgress(0, "Preparing PDF export...", "preparing")

      if (this.cancelled) return

      this.updateProgress(20, "Creating PDF document...", "processing")

      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Title
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      pdf.text(data.title, margin, yPosition)
      yPosition += 15

      if (data.subtitle) {
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "normal")
        pdf.text(data.subtitle, margin, yPosition)
        yPosition += 10
      }

      //  Metadata
      pdf.setFontSize(10)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 7
      pdf.text(`Total cases: ${data.cases.length}`, margin, yPosition)
      yPosition += 7
      pdf.text(`Text format: ${data.showSimplified ? "Simplified" : "Full verbatim"}`, margin, yPosition)
      yPosition += 15

      this.updateProgress(40, "Adding case data...", "processing")

      // Add cases
      data.cases.forEach((caseItem, index) => {
        if (this.cancelled) return

        if (index % 2 === 0) {
          this.updateProgress(
            40 + (index / data.cases.length) * 40,
            `Adding case ${index + 1} of ${data.cases.length}...`,
          )
        }

        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          pdf.addPage()
          yPosition = margin
        }

        // Case ID
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "bold")
        pdf.text(caseItem.case_id_text, margin, yPosition)
        yPosition += 10

        // Case title
        pdf.setFontSize(12)
        const titleLines = pdf.splitTextToSize(caseItem.title, contentWidth)
        pdf.text(titleLines, margin, yPosition)
        yPosition += titleLines.length * 7 + 5

        // Metadata
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.text(`Court: ${caseItem.court}`, margin, yPosition)
        yPosition += 7
        pdf.text(`Date: ${caseItem.date_of_judgment}`, margin, yPosition)
        yPosition += 7

        if (caseItem.parties) {
          const partiesLines = pdf.splitTextToSize(`Parties: ${caseItem.parties}`, contentWidth)
          pdf.text(partiesLines, margin, yPosition)
          yPosition += partiesLines.length * 7 + 5
        }

        // Operative parts
        if (caseItem.operative_parts && caseItem.operative_parts.length > 0) {
          pdf.setFont("helvetica", "bold")
          pdf.text("Operative Parts:", margin, yPosition)
          yPosition += 10

          caseItem.operative_parts.forEach((part) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage()
              yPosition = margin
            }

            pdf.setFont("helvetica", "bold")
            pdf.text(`Part ${part.part_number}:`, margin, yPosition)
            yPosition += 7

            pdf.setFont("helvetica", "normal")
            const partText = data.showSimplified ? part.simplified_text : part.verbatim_text
            const partLines = pdf.splitTextToSize(partText, contentWidth - 10)
            pdf.text(partLines, margin + 10, yPosition)
            yPosition += partLines.length * 5 + 8
          })
        }

        yPosition += 10 // Space between cases
      })

      if (this.cancelled) return

      this.updateProgress(80, "Finalizing PDF...", "generating")

      this.updateProgress(90, "Downloading file...")

      pdf.save(`eu-law-report-${Date.now()}.pdf`)

      this.updateProgress(100, "Export complete!", "complete")
    } catch (error) {
      console.error("PDF export error:", error)
      this.updateProgress(100, "Export failed", "error")
      throw error
    }
  }
}
