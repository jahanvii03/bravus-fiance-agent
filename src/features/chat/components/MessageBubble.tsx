import {  motion } from "framer-motion"
import { Table, Bot,  ThumbsUp, ThumbsDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState, useEffect } from 'react'
import JSZip from 'jszip'
import Swal from "sweetalert2"

export interface TableData {
    [key: string]: string | number;
}

interface Message {
    data: any
    thread_id: string;
    role: "user" | "assistant";
    content: string;
    sql_query?: string;
    sql_query_response?: string | string[];
    executed_sql?: string | string[];
    feedback?: "like" | "dislike" | null;
    feedback_reason?: string | null;
}

interface MessageBubbleProps {
    message: Message
    onOpenModal: (type: "table" | "chart") => void
    setDataBarData: React.Dispatch<React.SetStateAction<any[]>>
    // setDataBarData: React.Dispatch<React.SetStateAction<TableData[]>>
    onFeedback?: (message: Message, feedback: "like" | "dislike") => Promise<void>;
}

export default function MessageBubble({ message, onOpenModal, setDataBarData, onFeedback }: MessageBubbleProps) {
    const [showIframe, setShowIframe] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [finalDomain, setFinalDomain] = useState<string | null>(null);
    const [isSingleDocDownloading, setIsSingleDocDownloading] = useState(false);
    const [invoiceType, setInvoiceType] = useState<string | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState<"like" | "dislike" | null>(message.feedback || null);
    const [isLikeClicked, setIsLikeClicked] = useState(currentFeedback === "like");
    const [isDislikeClicked, setIsDislikeClicked] = useState(currentFeedback === "dislike");
    const [isDislikeModalOpen, setIsDislikeModalOpen] = useState(false);
    const headerMapping = {
        'ID': 'ID',
        'bravusSupplier': 'Vendor',
        'adaniNFAStatus': 'Status',
        'bravusContractValue': 'Contract Value',
        'bravusContractTermEndDate': 'Contract End Date',
        'Created': 'Created On',
        'Author': 'Created By',
        'bravuscontractOwner': 'Contract Owner',
        'adaniRefNo': 'NFA No.',
        'adaniProcessOrderNo': 'PO Number',
        'Processor': 'Pending With',
        'approver': 'Pending With',
        'count': 'Pending Count',
        'adaniInvoiceNumber': 'Invoice No.',
        'adaniVendorName': 'Vendor',
        'adaniDuedate': 'Due Date',
        'TotalInvoiceValue': 'Invoice Value (Inc GST)',
        'adaniCCCode': 'Company Code',
        'adaniInvoiceReceivedDate': 'Inv Received Date'
    }


    const handleLike = async () => {
        console.log("MessageBubble: Like button clicked for message:", message.id);
        const result = await Swal.fire({
            input: "textarea",
            inputLabel: "Please provide a reason for liking the response:",
            inputPlaceholder: "Type your reason here...",
            showCancelButton: true,
            confirmButtonColor: "#193566ff",
            cancelButtonColor: "rgba(160, 160, 160, 1)",
            confirmButtonText: "Submit",
            didOpen: (modal) => {
                const input = modal.querySelector('textarea') as HTMLTextAreaElement;
                if (input) {
                    input.style.minHeight = '80px';
                    input.style.resize = 'vertical';
                }
                // Add red asterisk label
                const label = modal.querySelector('.swal2-label') as HTMLElement;
                if (label) {
                    const asterisk = document.createElement('span');
                    asterisk.textContent = ' *';
                    asterisk.style.color = 'red';
                    asterisk.style.fontWeight = 'bold';
                    label.appendChild(asterisk);
                }
            },
            preConfirm: (value) => {
                if (!value || value.trim() === '') {
                    Swal.showValidationMessage('Please provide a reason (required)');
                    return false;
                }
                return value;
            }
        })

        if (!result.value || result.isConfirmed === false) {
            console.log("User cancelled or didn't provide reason");
            return;
        }

        const feedback_reason = result.value.trim();
        console.log(feedback_reason);

        setFeedbackLoading(true);
        try {
            const userId = (await fetch('/api/current-user').then(r => r.json())).userId;
            const threadId = new URLSearchParams(window.location.search).get('thread_id') || message.thread_id;
            console.log("????????????????????????///", threadId);

            const response = await fetch(
                `/api/users/${userId}/chats/${threadId}/messages/${message.id}/feedback?feedback=like&feedback_reason=${encodeURIComponent(feedback_reason)}`,
                { method: 'PUT' }
            );

            console.log(response);

            if (!response.ok) throw new Error('Failed to submit feedback');

            setCurrentFeedback("like");
            setIsLikeClicked(true);
            setIsDislikeClicked(false);

            // Show success toast
            await Swal.fire({
                icon: 'success',
                title: 'Your feedback has been recorded successfully!',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });

            if (onFeedback) {
                await onFeedback(message, "like");
            }
        } catch (error) {
            console.error("Error submitting like feedback:", error);
            setCurrentFeedback(null);

            // Show error toast
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to submit feedback. Please try again.',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        } finally {
            setFeedbackLoading(false);
        }
    };

    const handleDislike = async () => {
        console.log("MessageBubble: Dislike button clicked for message:", message.id);
        const result = await Swal.fire({
            input: "textarea",
            inputLabel: "Please provide a reason for disliking the response:",
            inputPlaceholder: "Type your reason here...",
            showCancelButton: true,
            confirmButtonColor: "#193566ff",
            cancelButtonColor: "rgba(160, 160, 160, 1)",
            confirmButtonText: "Submit",
            didOpen: (modal) => {
                const input = modal.querySelector('textarea') as HTMLTextAreaElement;
                if (input) {
                    input.style.minHeight = '80px';
                    input.style.resize = 'vertical';
                }
                // Add red asterisk label
                const label = modal.querySelector('.swal2-label') as HTMLElement;
                if (label) {
                    const asterisk = document.createElement('span');
                    asterisk.textContent = ' *';
                    asterisk.style.color = 'red';
                    asterisk.style.fontWeight = 'bold';
                    label.appendChild(asterisk);
                }
            },
            preConfirm: (value) => {
                if (!value || value.trim() === '') {
                    Swal.showValidationMessage('Please provide a reason (required)');
                    return false;
                }
                return value;
            }
        })

        if (!result.value || result.isConfirmed === false) {
            console.log("User cancelled or didn't provide reason");
            return;
        }

        const feedback_reason = result.value.trim();
        console.log(feedback_reason);

        setFeedbackLoading(true);
        try {
            const userId = (await fetch('/api/current-user').then(r => r.json())).userId;
            const threadId = new URLSearchParams(window.location.search).get('thread_id') || message.thread_id;
            console.log("????????????????????????///", threadId);

            const response = await fetch(
                `/api/users/${userId}/chats/${threadId}/messages/${message.id}/feedback?feedback=dislike&feedback_reason=${encodeURIComponent(feedback_reason)}`,
                { method: 'PUT' }
            );
            console.log(response);

            if (!response.ok) throw new Error('Failed to submit feedback');

            setCurrentFeedback("dislike");
            setIsDislikeClicked(true);
            setIsLikeClicked(false);

            // Show success toast
            await Swal.fire({
                icon: 'success',
                title: 'Your feedback has been recorded successfully!',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });

            if (onFeedback) {
                await onFeedback(message, "dislike");
            }
        } catch (error) {
            console.error("Error submitting dislike feedback:", error);
            setCurrentFeedback(null);

            // Show error toast
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to submit feedback. Please try again.',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        } finally {
            setFeedbackLoading(false);
        }
    };


   // Replace the existing handleTableClick with this:
    const handleTableClick = (sql_query: string, sql_query_response: string | string[], executed_sql: string | string[]) => {
        try {
            let dataToSet: any = [];

            // 1. Check if executed_sql exists and handle Array vs String
            if (executed_sql) {
                if (Array.isArray(executed_sql)) {
                    // CASE: It is an array (Multiple tables/locations). 
                    // We pass the array of strings directly. PowerAlarmTable will parse them into tabs.
                    console.log("Setting multiple table data (Array)");
                    dataToSet = executed_sql;
                } else if (typeof executed_sql === 'string' && executed_sql.trim() !== '') {
                    // CASE: It is a single string. Parse it immediately.
                    const parsed = JSON.parse(executed_sql);
                    console.log("Setting single table data (String)");
                    // Ensure it's wrapped in an array if it's a single object
                    dataToSet = Array.isArray(parsed) ? parsed : [parsed];
                }
            }

            // 2. Fallback to sql_query_response if executed_sql was empty
            if ((!dataToSet || dataToSet.length === 0) && sql_query_response) {
                if (Array.isArray(sql_query_response)) {
                    dataToSet = sql_query_response;
                } else if (typeof sql_query_response === 'string' && sql_query_response.trim() !== '') {
                    // Check if it's the KM keyword or actual JSON
                    if (sql_query_response !== 'KM Download Invoice') {
                        const fallbackData = JSON.parse(sql_query_response);
                        dataToSet = Array.isArray(fallbackData) ? fallbackData : [fallbackData];
                    }
                }
            }

            if (!dataToSet || dataToSet.length === 0) {
                console.warn("No table data available to display");
                setDataBarData([]);
            } else {
                setDataBarData(dataToSet);
            }

            onOpenModal("table");
        } catch (error) {
            console.error("Error parsing table data:", error);
            setDataBarData([{
                error: "Failed to parse table data",
                raw_data: "Check console for details"
            }]);
            onOpenModal("table");
        }
    };

    const parseDocumentIds = (sqlQuery: string): { ids: string[], domain: string } => {
        if (!sqlQuery) return { ids: [], domain: 'PO_Invoices' };

        try {
            const parsedData = JSON.parse(sqlQuery);
            if (parsedData.domain && parsedData.document_ids) {
                const ids = parsedData.document_ids
                    .split(',')
                    .map((id: string) => id.trim())
                    .filter((id: string) => id.length > 0);
                return { ids, domain: parsedData.domain };
            }
        } catch (e) {
            // Fallback to old format (comma-separated IDs)
            console.log("Parsing as legacy format");
        }

        const ids = sqlQuery
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);

        return { ids, domain: 'PO_Invoices' };
    };

    const parseTableData = (executedSql: string, documentInfo: { ids: string[], domain: string }) => {
        try {
            if (executedSql && executedSql.trim() !== '') {
                const data = JSON.parse(executedSql);
                const dataArray = Array.isArray(data) ? data : [data];

                return dataArray.map((row, index) => ({
                    ...row,
                    DocumentId: documentInfo.ids[index] || documentInfo.ids[0] || 'N/A',
                    DocumentLink: documentInfo.ids[index] || documentInfo.ids[0] || null,
                    Domain: documentInfo.domain
                }));
            }
        } catch (error) {
            console.error("Error parsing executed_sql for inline display:", error);
        }
        return null;
    };

    const AMOUNT_COLUMNS = [
        'bravusContractValue',
        'TotalInvoiceValue',
        'adaniBasicInvoiceValue',
        'Total Value',
        'Total_Value',
        'Total Amount AUD',
        'Total_Amount_AUD',
        'Amount_in_Local_Currency_AUD',
        'AmmendedNFAValue',
        'SumOfAmendmentValue',
        'AmmendedDRAValue',
        'OriginalDRAValue',
        'OriginalNFAValue',
        'SumOfAmendments',
        'brsTotalValueIncludingGST',
        'brsBasicValue',
        'TotalAmendedValue'
    ];
const formatHeader = (key:string) => {
  return key
    .replace(/</g, " < ")
    .replace(/>/g, " > ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^adani/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
    const isAmountColumn = (columnName: string): boolean => {
        return AMOUNT_COLUMNS.some(col => col.toLowerCase() === columnName.toLowerCase());
    };


    const determineDomainFromInvoiceData = (documentRow: any): string => {
        const adaniInvoiceType = documentRow?.adaniInvoiceType;
        const generatedPrNo = documentRow?.GeneratedPrNo;

        if (adaniInvoiceType === 'Without PO Invoice') {
            return 'Without_PO_Invoices';
        } else {
            // Check GeneratedPrNo for PO invoices
            if (generatedPrNo != null && generatedPrNo !== '') {
                return 'PO_Invoices';
            } else {
                return 'With_PO_Invoices';
            }
        }
    };

    const mapSqlQueryToDomain = (sqlQuery: string): string => {
        // First try to get domain from structured data
        try {
            const parsedData = JSON.parse(sqlQuery);
            if (parsedData.domain) {
                return parsedData.domain;
            }
        } catch (e) {
            // Fallback to SQL query inspection for legacy format
            if (sqlQuery && sqlQuery.includes('PO_Invoice_Detail')) {
                return 'PO_Invoices';
            } else if (sqlQuery && sqlQuery.includes('NonPOInvoiceTracker')) {
                return 'Non_PO_Invoices';
            }
        }

        // Default fallback
        return 'PO_Invoices';
    };

    const handleDocumentLinkClick = (documentId: string, domain?: string) => {
        if (documentId && documentId !== 'N/A') {
            const finalDomain = domain || (message.sql_query ? mapSqlQueryToDomain(message.sql_query) : 'PO_Invoices');
            handleShowPDF(documentId, finalDomain);
        }
    };

    const handleSingleDocumentDownload = async () => {
        setIsSingleDocDownloading(true);

        try {
            const response = await fetch(`/api/sharepoint/file-preview/listitem/${selectedDocumentId}/${finalDomain}`);

            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `document_${selectedDocumentId}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Single document download error:', error);
        } finally {
            setIsSingleDocDownloading(false);
        }
    };

    const handleBulkDownload = async () => {
        const documentInfo = parseDocumentIds(message.sql_query || '');

        if (documentInfo.ids.length === 0) {
            return;
        }

        setIsDownloading(true);

        try {
            const zip = new JSZip();
            const downloadPromises: Promise<void>[] = [];
            let successCount = 0;
            let errorCount = 0;

            for (const docId of documentInfo.ids) {
                const promise = (async () => {
                    try {
                        console.log(`Downloading document: ${docId} from domain: ${documentInfo.domain}`);

                        let finalDomainForDownload = documentInfo.domain;

                        if (documentInfo.domain === 'PO_Invoices' && tableData) {
                            try {
                                const documentRow = tableData.find(row =>
                                    String(row.DocumentId) === String(docId)
                                );

                                if (documentRow) {
                                    finalDomainForDownload = determineDomainFromInvoiceData(documentRow);

                                    console.log('=== Bulk Download Domain Logic ===');
                                    console.log({
                                        documentId: docId,
                                        originalDomain: documentInfo.domain,
                                        adaniInvoiceType: documentRow?.adaniInvoiceType,
                                        generatedPrNo: documentRow?.GeneratedPrNo,
                                        finalDomain: finalDomainForDownload,
                                        apiUrl: `/api/sharepoint/file-preview/listitem/${docId}/${finalDomainForDownload}`
                                    });
                                    console.log('==================================');
                                }
                            } catch (error) {
                                console.error('Error determining domain for bulk download:', error);
                                finalDomainForDownload = documentInfo.domain;
                            }
                        }

                        const response = await fetch(`/api/sharepoint/file-preview/listitem/${docId}/${finalDomainForDownload}`);
                        console.log("=================response", response);
                        console.log("Final API URL:", `/api/sharepoint/file-preview/listitem/${docId}/${finalDomainForDownload}`);

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }

                        const blob = await response.blob();

                        const contentDisposition = response.headers.get('Content-Disposition');
                        let filename = `document_${docId}.pdf`;

                        if (contentDisposition) {
                            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                            if (filenameMatch && filenameMatch[1]) {
                                filename = filenameMatch[1].replace(/['"]/g, '');
                            }
                        }
                        const safeFilename = `${docId}_${filename}`;

                        zip.file(safeFilename, blob);
                        successCount++;
                        console.log(`Successfully added ${safeFilename} to ZIP`);

                    } catch (error) {
                        console.error(`Error downloading document ${docId}:`, error);
                        const errorContent = `Error downloading document ${docId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        zip.file(`ERROR_${docId}.txt`, errorContent);
                        errorCount++;
                    }
                })();

                downloadPromises.push(promise);
            }

            await Promise.all(downloadPromises);

            console.log(`Download summary: ${successCount} successful, ${errorCount} errors`);

            if (successCount === 0) {
                throw new Error('No documents were successfully downloaded');
            }
            console.log('Generating ZIP file...');
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
            const zipFilename = `documents_${documentInfo.domain}_${timestamp}.zip`;

            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = zipFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log(`ZIP file "${zipFilename}" downloaded successfully`);

        } catch (error) {
            console.error('Bulk download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const documentInfo = message.sql_query_response === 'KM Download Invoice'
        ? parseDocumentIds(message.sql_query || '')
        : { ids: [], domain: 'PO_Invoices' };

    const getFirstSqlResult = (sqlData: string | string[] | undefined): string => {
        if (!sqlData) return '';
        if (Array.isArray(sqlData)) return sqlData[0] || '';
        return sqlData;
    };

    const tableData = message.sql_query_response === 'KM Download Invoice'
        ? parseTableData(getFirstSqlResult(message.executed_sql), documentInfo)
        : null;

    // const tableData = message.sql_query_response === 'KM Download Invoice'
    //     ? parseTableData(message.executed_sql[0] || '', documentInfo)
    //     : null;
console.log(message.data,'in bubble');

    useEffect(() => {
        const determineFinalDomain = async () => {
            if (!selectedDocumentId || !selectedDomain) {
                setFinalDomain(null);
                return;
            }

            if (selectedDomain === 'PO_Invoices') {
                try {
                    const documentRow = tableData?.find(row =>
                        String(row.DocumentId) === String(selectedDocumentId)
                    );

                    if (documentRow) {
                        const domainToUse = determineDomainFromInvoiceData(documentRow);
                        setInvoiceType(domainToUse || null);

                        console.log('=== API Preview Payload ===');
                        console.log({
                            documentId: selectedDocumentId,
                            originalDomain: selectedDomain,
                            adaniInvoiceType: documentRow?.adaniInvoiceType,
                            generatedPrNo: documentRow?.GeneratedPrNo,
                            finalDomain: domainToUse,
                            apiUrl: `/api/sharepoint/file-preview/listitem/${selectedDocumentId}/${domainToUse}`
                        });
                        console.log('=========================');

                        setFinalDomain(domainToUse);
                    } else {
                        setFinalDomain('PO_Invoices'); // Default fallback
                    }
                } catch (error) {
                    console.error('Error determining domain:', error);
                    setFinalDomain('PO_Invoices'); // Fixed the typo from 'Po_Invoice'
                }
            } else {
                setFinalDomain(selectedDomain);
            }
        };

        determineFinalDomain();
    }, [selectedDocumentId, selectedDomain, tableData]);

    const apiPreviewUrl = selectedDocumentId && finalDomain
        ? `/api/sharepoint/file-preview/listitem/${selectedDocumentId}/${finalDomain}`
        : null;

    console.log("Document Info:", documentInfo);
    console.log("Selected Document ID:", selectedDocumentId);
    console.log("Selected Domain:", selectedDomain);
    console.log("Final Domain for API:", finalDomain);
    console.log("Table Data for KM:", tableData);

    const handleShowPDF = (documentId: string, domain: string) => {
        setSelectedDocumentId(documentId);
        setSelectedDomain(domain);
        setShowIframe(true);
    };

    const closeSidebar = () => {
        setShowIframe(false);
        setSelectedDocumentId(null);
        setSelectedDomain(null);
    };

    // const hasTableData = () => {
    //     return (message.executed_sql && message.executed_sql.trim() !== '') ||
    //         (message.sql_query_response && message.sql_query_response.trim() !== '' && message.sql_query_response !== 'KM Download Invoice');
    // };

    // Replace the existing hasTableData with this:
    const hasTableData = () => {
        // Check executed_sql
        if (message.executed_sql) {
            if (Array.isArray(message.executed_sql)) {
                return message.executed_sql.length > 0;
            }
            if (typeof message.executed_sql === 'string') {
                return message.executed_sql.trim() !== '';
            }
        }

        // Check sql_query_response
        if (message.sql_query_response && message.sql_query_response !== 'KM Download Invoice') {
            if (Array.isArray(message.sql_query_response)) {
                return message.sql_query_response.length > 0;
            }
            return typeof message.sql_query_response === 'string' && message.sql_query_response.trim() !== '';
        }

        return false;
    };

    // const hasTableData = () => {
    //     return (message.executed_sql[0] && message.executed_sql[0].trim() !== '') ||
    //         (message.sql_query_response && message.sql_query_response.trim() !== '' && message.sql_query_response !== 'KM Download Invoice');
    // };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
            <div className={`${message.role === "user" ? "max-w-xs lg:max-w-md xl:max-w-lg order-2" : "max-w-full lg:max-w-3xl xl:max-w-4xl order-1"}`}>
                {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#273658] rounded-lg flex items-center justify-center">
                            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                                <Bot className="w-4 h-4 text-gray-800" />
                            </div>
                        </div>
                        <span className="text-sm text-gray-600">AI Agent</span>
                    </div>
                )}

              <motion.div
  className={`p-4 rounded-2xl ${
    message.role === "user"
      ? "bg-[#273658] text-white ml-4 shadow-lg"
      : "bg-white border border-gray-200 mr-4 shadow-lg"
  } overflow-hidden`}
>
  {message.role === "assistant" ? (
    <div className="prose prose-sm max-w-none">

      {/* KM Download Invoice */}
      {message?.sql_query_response === "KM Download Invoice" ? (
        <div className="text-sm text-gray-700">
          {/* 👉 Replace this with your ACTUAL KM UI (you removed it earlier) */}
          KM Invoice UI goes here
        </div>
      ) : (
        <>
          {/* Markdown Content */}
          {message?.content && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-xl font-bold mt-4 mb-3 text-gray-800" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="mb-2 text-gray-800 leading-relaxed" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {/* Data Table */}
          {Array.isArray(message?.data) && message?.data.length > 0 && (
            <div className="mt-4">
              {/* <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Data Results:
              </h4> */}

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-[#273658]">
                    <tr>
                      {Object.keys(message?.data[0]).map((key) => (
                        <th
                          key={key}
                          className="px-3 py-2 text-white text-left text-xs font-medium uppercase border-r last:border-r-0"
                        >
                          {formatHeader(key)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {message?.data.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.keys(message?.data[0]).map((key, j) => (
                          <td
                            key={j}
                            className="px-3 py-2 text-gray-900 border-r last:border-r-0 break-words"
                          >
                            {String(row[key] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 text-xs text-gray-500 text-center">
                Showing {message?.data.length} results
              </div>
            </div>
          )}
        </>
      )}

      {/* Optional SQL Summary */}
      {message?.sql_query && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <details className="text-sm">
            <summary className="cursor-pointer font-bold text-gray-700 hover:text-[#273658]">
              View Summary
            </summary>
            <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200 overflow-x-auto">
              <code className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                {typeof message.sql_query === "string" &&
                message.sql_query.startsWith("{")
                  ? JSON.stringify(JSON.parse(message.sql_query), null, 2)
                  : message.sql_query}
              </code>
            </div>
          </details>
        </div>
      )}
    </div>
  ) : (
    <p className="text-sm lg:text-base break-words leading-relaxed">
      {message.content}
    </p>
  )}
</motion.div>

                {/* Updated condition to show table button for all messages with table data (excluding KM queries) */}
                <div className="flex items-center gap-2 mt-3 mr-4 flex-wrap">

                    {/* Condition 1 */}
                    {message.role === "assistant" &&
                        message.sql_query_response !== "KM Download Invoice" &&
                        hasTableData() && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {/* Button 1 */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        handleTableClick(
                                            message.sql_query || "",
                                            message.sql_query_response || "",
                                            message.executed_sql || ""
                                        )
                                    }
                                    className="flex items-center gap-2 px-3 py-2 bg-white shadow-lg text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-[#273658] transition-colors border border-gray-200"
                                    title="View Data Table"
                                >
                                    <Table className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                        )}

                    {/* Condition 2 */}
                    {message.role === "assistant" && hasTableData() && (
                        <>
                            {/* Like */}
                            {isLikeClicked ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLike}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-200 shadow-lg text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-[#273658] transition-colors border border-gray-400"
                                    title="Good Response"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </motion.button>) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLike}
                                    className="flex items-center gap-2 px-3 py-2 bg-white shadow-lg text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-[#273658] transition-colors border border-gray-200"
                                    title="Good Response"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </motion.button>
                            )}

                            {/* Dislike */}
                            {isDislikeClicked ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDislike}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-200 shadow-lg text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-[#273658] transition-colors border border-gray-400"
                                    title="Bad Response"
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </motion.button>) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDislike}
                                    className="flex items-center gap-2 px-3 py-2 bg-white shadow-lg text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-[#273658] transition-colors border border-gray-200"
                                    title="Bad Response"
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </motion.button>
                            )}
                            {/* {isDislikeModalOpen && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                                    >
                                        <button
                                            onClick={() => {
                                                console.log();
                                                
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                                        >                                           
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                </AnimatePresence>
                            )} */}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    )
}