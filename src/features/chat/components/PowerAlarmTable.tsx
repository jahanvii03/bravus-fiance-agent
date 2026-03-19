import { Upload } from "lucide-react"
import type { TableData } from "./MessageBubble"
import { Button } from "../../../shared/components/ui/button"
// import * as XLSX from "xlsx"
import { useState, useRef, useEffect } from "react"
import "../../../shared/components/ui/hide-scrollbar.css"

interface TableDataProps {
  data: TableData[] | TableData[][] | string[]
  searchTerm?: string
  className?: string
}

const AMOUNT_COLUMNS = [
  "bravusContractValue",
  "TotalInvoiceValue",
  "adaniBasicInvoiceValue",
  "Total Value",
  "Total_Value",
  "Total Amount AUD",
  "Total_Amount_AUD",
  "Amount_in_Local_Currency_AUD",
  "AmmendedNFAValue",
  "SumOfAmendmentValue",
  "AmmendedDRAValue",
  "OriginalDRAValue",
  "SumOfAmendments",
  "brsTotalValueIncludingGST",
  "brsBasicValue",
  "TotalAmendmentValue",
  "TotalAmendmentNFAValue",
  "TotalAmmendedNFAValue",
  "TotalOriginalDRAValue",
  "TotalAmendmentDRAValue",
  "TotalAmendmentDRAValue",
  "TotalAmmendedDRAValue",
  "NFA_OriginalValue",
  "NFA_AmendmentValue",
  "NFA_AmmendedValue",
  "DRA_OriginalValue",
  "DRA_AmendmentValue",
  "DRA_AmmendedValue",
  "TotalOriginalNFAValue",
  "OriginalNFAValue",
  "TotalAmendedValue",
  "AmendedValue",
  "adaniPOOpenValue",
  "adaniProcessOrderValue",
  "AmendedNFAValue"
]

const headerMapping = {
  'bravusSupplier': 'Vendor Name',
  'adaniNFAStatus': 'NFA Status',
  'bravusContractValue': 'NFA Value',
  'bravusContractTermEndDate': 'NFA End Date',
  'Created': 'Created',
  'Author': 'Created By',
  'bravuscontractOwner': 'Contraft Owner',
  'adaniRefNo': 'NFA No.',
  'adaniProcessOrderNo': 'PO No.',
  'Processor': 'Processor',
  'approver': 'Pending With',
  'count': 'Pending Count',
  'adaniInvoiceNumber': 'Invoice No.',
  'adaniVendorName': 'Vendor Name',
  'adaniDuedate': 'Due Date',
  'TotalInvoiceValue': 'Invoice Value (Incl. GST)',
  'adaniCCCode': 'Company Code',
  'adaniInvoiceReceivedDate': 'Inv Received Date',
  'AdaniBasicInvoiceValue': 'Invoice Value (ex. GST)',
  'AdaniCurrency': 'Currency',
  'Status': 'Status',
  'AdaniProcessorName': 'Invoice Processor',
  'AdaniInvoiceDate': 'Invoice Date',
  'AdaniDueDate': 'Due Date',
  'PaymentDate': 'Payment Date',
  'InvoiceApprovedDate': 'Invoice Approved Date',
  'brsDRARefNo': 'DRA No.',
  'brsProcessOrderNo': 'Purchase Order No.',
  'brsSupplier': 'Vendor Name',
  'brsDRAStatus': 'DRA Status',
  'brsPRNumber': 'PR No.',
  'CommercialVertical': 'Vertical',
  'adaniApprovalProcessStatus': 'Status',
  'adaniApproverProjecthead': 'Project Head',
  'adaniPODescription': 'PO Description',
  'adaniProcessStartDate': 'Start Date',
  'adaniProcessEndDate': 'End Date',
  'adaniInvoiceApprover': 'Invoice Approver',
  'adaniProjectManager': 'Project Manager',
  'adaniPOOpenValue': 'PO Open Value',
  'adaniProcessOrderValue': 'PO Value',
  'SumOfAmendmentValue': 'NFA Amendment Value',
  'AmmendedNFAValue': 'NFA Amended Value',
};

const isValueColumn = (columnName: string): boolean => {
  return columnName.toLowerCase().endsWith("value")
}

const hyperlinkConfig = {
  adaniNFAStatus: {
    linkColumn: "adaniRefNo", //"NFA No.", //"adaniRefNo",
    buildUrl: (id: string) =>
      `https://adaniaustralia.sharepoint.com/sites/commercialprocess/SitePages/NFA.aspx?NfaId=${id}&iseditmode=yes`,
  },
  brsDRAStatus: {
    linkColumn: "brsDRARefNo",
    buildUrl: (id: string) =>
      `https://adaniaustralia.sharepoint.com/sites/commercialprocess/SitePages/DRA.aspx?DraId=${id}&iseditmode=yes`,
  },
  adaniPODescription: {
    linkColumn: "adaniProcessOrderNo",
    buildUrl: (id: string) =>
      `https://adaniaustralia.sharepoint.com/sites/commercialprocess/SitePages/PORecords.aspx?POId=${id}&iseditmode=yes`,
  },
  InvoiceApprovedDate: {
    linkColumn: "adaniInvoiceNumber",
    buildUrl: (id: string) =>
      `https://adaniaustralia.sharepoint.com/sites/commercialprocess/SitePages/InvoiceTracker.aspx?IId=${id}&iseditmode=yes`,
  },
  adaniApproverProjecthead: {
    linkColumn: "adaniInvoiceNumber",
    buildUrl: (id: string) =>
      `https://adaniaustralia.sharepoint.com/sites/commercialprocess/SitePages/NOPOInvoiceTracker.aspx?IId=${id}&iseditmode=yes`,
  },
}

const isAmountColumn = (columnName: string): boolean =>
  AMOUNT_COLUMNS.some((col) => col.toLowerCase() === columnName.toLowerCase())

const formatColumnHeader = (column: string): string => {
  if (headerMapping[column as keyof typeof headerMapping]) {
    return headerMapping[column as keyof typeof headerMapping]
  }
  return column
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

const isNestedArray = (data: any[]): data is TableData[][] => {
  return Array.isArray(data[0]) && !Array.isArray(data[0][0])
}

const parseExecutedSql = (data: any[]): TableData[][] => {
  const tables: TableData[][] = []

  if (data.length === 1 && typeof data[0] === "string") {
    try {
      const cleanedString = data[0].trim()
      const parsed = JSON.parse(cleanedString)

      // If parsed result is an array of objects, return it as a single table
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
        console.log("Successfully parsed JSON array with", parsed.length, "rows")
        return [parsed]
      }
    } catch (e) {
      console.error("Failed to parse single JSON string:", e)
      console.log("Raw data:", data[0].substring(0, 200))
    }
  }

  data.forEach((item) => {
    // Skip error entries
    if (typeof item === "string" && item.startsWith("Error executing query:")) {
      console.log("Skipping error entry")
      return
    }
    // If it's a string, try to parse it as JSON
    if (typeof item === "string") {
      try {
        const cleanedString = item.trim()
        const parsed = JSON.parse(cleanedString)
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
          tables.push(parsed)
          console.log("Successfully parsed table with", parsed.length, "rows")
        }
      } catch (e) {
        console.error("Failed to parse item:", e)
      }
    }
    // If it's already an array of objects, add it
    else if (Array.isArray(item) && item.length > 0 && typeof item[0] === "object") {
      tables.push(item)
      console.log("Added array directly with", item.length, "rows")
    }
  })
  console.log("Total tables parsed:", tables.length)
  return tables
}

export default function PowerAlarmTable({ data, searchTerm = "", className = "" }: TableDataProps) {
  const [activeTab, setActiveTab] = useState(0)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const bodyScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bodyScroll = bodyScrollRef.current
    const headerScroll = headerScrollRef.current

    if (!bodyScroll || !headerScroll) return

    const handleBodyScroll = () => {
      headerScroll.scrollLeft = bodyScroll.scrollLeft
    }

    bodyScroll.addEventListener("scroll", handleBodyScroll)
    return () => bodyScroll.removeEventListener("scroll", handleBodyScroll)
  }, [])

  // Parse executed_sql format if needed
  let processedData: TableData[][]
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
    // This is executed_sql format - filter and parse
    processedData = parseExecutedSql(data)
  } else if (data.length > 0 && isNestedArray(data as any[])) {
    // Already nested array
    processedData = data as TableData[][]
  } else {
    // Single table
    processedData = [data as TableData[]]
  }

  if (processedData.length === 0 || processedData.every((table) => table.length === 0)) {
    return (
      <div className={`${className} flex items-center justify-center h-full bg-white shadow-sm border`}>
        <p className="text-gray-500 text-lg">No data available</p>
      </div>
    )
  }

  const currentData = processedData[activeTab] || []
  const getColumns = (data: any[]) => (data && data.length > 0 ? Object.keys(data[0]) : [])
  const columns = getColumns(currentData)

  const filteredData = currentData.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export!")
      return
    }
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, "-")
    const filename = `${timestamp}.xlsx`
    const toPascalCase = (str: string): string => {
      return str
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("")
    }
    const exportData = filteredData.map((row) => {
      const newRow: any = {}
      Object.keys(row).forEach((key) => {
        const pascalCaseKey = toPascalCase(key)
        newRow[pascalCaseKey] = row[key as keyof typeof row]
      })
      return newRow
    })
    // const worksheet = XLSX.utils.json_to_sheet(exportData)
    // const workbook = XLSX.utils.book_new()
    // XLSX.utils.book_append_sheet(workbook, worksheet, "")
    // XLSX.writeFile(workbook, filename)
  }

  const getColumnWidth = (column: string) => {
    if (!filteredData.length) return "min-w-48"
    const maxContentLength = Math.max(
      column.length,
      ...filteredData.map((row) => String(row[column] || "").length)
    )
    // Increased all width values to show full content
    if (maxContentLength <= 10) return "w-32 min-w-32"
    if (maxContentLength <= 20) return "w-48 min-w-48"
    if (maxContentLength <= 30) return "w-64 min-w-64"
    if (maxContentLength <= 50) return "w-80 min-w-80"
    if (maxContentLength <= 80) return "w-96 min-w-96"
    if (maxContentLength <= 120) return "w-[500px] min-w-[500px]"
    return "w-[600px] min-w-[600px]"
  }

  const shouldWrapContent = (content: string) => String(content).length > 30

  return (
    <div className={`${className} bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col`}>
      {/* Tab Navigation - Show if multiple tables */}
      {processedData.length > 1 && (
        <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-50">
          {processedData.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === index
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Table {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Fixed Export Button Header */}
      <div className={`flex justify-end p-3 bg-white border-b border-gray-200 sticky ${activeTab === 0 ? "top-0" : "top-8"} z-40`}>
        <Button variant="outline" className="bg-blue-50 border-blue-200 flex items-center gap-2" onClick={handleExport}>
          <Upload className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>

      {/* Fixed Header - scrolls horizontally only, scrollbar hidden */}
      <div
        ref={headerScrollRef}
        className={`overflow-x-auto overflow-y-hidden sticky ${activeTab === 0 ? "top-15 mb-1" : "top-20 mb-10"} z-30 hide-scrollbar `}
      >
        <table className="w-full table-auto" style={{ minWidth: "max-content" }}>
          <thead className="bg-[#273658] shadow-sm">
            <tr>
              {columns.map((column) => {
                const displayHeader = formatColumnHeader(column)
                return (
                  <th
                    key={column}
                    className={`px-4 py-3 text-xs font-semibold text-white uppercase border-r border-[#273658] last:border-r-0 ${getColumnWidth(column)} ${isValueColumn(column) ? "text-right" : "text-left"}`}
                  >
                    <span className="block break-words leading-tight" title={displayHeader}>
                      {displayHeader}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
        </table>
      </div>

      {/* Body scrollable container */}
      <div ref={bodyScrollRef} className="flex-1 overflow-auto hide-scrollbar">
        <table className="w-full table-auto">
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 italic">
                  No matching records found
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50 transition-all duration-200 ease-in-out hover:shadow-sm`}
                >
                  {columns.map((column) => {
                    const cellContent = String(row[column] || "")
                    const shouldWrap = shouldWrapContent(cellContent)
                    const isAmount = isAmountColumn(column)
                    let isHyperlink = false
                    let finalUrl = "#"
                    for (const statusColumn in hyperlinkConfig) {
                      if (columns.includes(statusColumn)) {
                        const config = hyperlinkConfig[statusColumn as keyof typeof hyperlinkConfig]
                        if (column === config.linkColumn) {
                          const idValue = row["ID"]
                          isHyperlink = true
                          finalUrl = idValue ? config.buildUrl(String(idValue)) : "#"
                          break
                        }
                      }
                    }
                    const displayContent = isAmount ? (row[column]) : cellContent
                    return (
                      <td
                        key={column}
                        className={`px-2 py-1 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 ${getColumnWidth(column)} whitespace-normal break-words ${isValueColumn(column) ? "text-right" : "text-left"}`}
                      >
                        <div className={`flex items-start ${isAmount ? "justify-end" : "justify-start"}`}>
                          {isHyperlink ? (
                            <a
                              href={finalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline leading-relaxed break-words"
                              title={cellContent}
                            >
                              {displayContent}
                            </a>
                          ) : (
                            <span
                              className="leading-relaxed break-words"
                              title={cellContent}
                            >
                              {displayContent}
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fixed Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex-shrink-0 sticky bottom-0 z-30">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredData.length}</span> of{" "}
            <span className="font-medium">{currentData.length}</span> results
          </p>
        </div>
      </div>
    </div>
  )
}
