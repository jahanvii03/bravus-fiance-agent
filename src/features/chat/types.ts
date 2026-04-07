export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    sql_query?: string
    sql_query_response?: string
    sap_data?: any[]
    rephrased_query?: string
    chat_type?: string
    sources?: Array<{
        title: string
        source: string
        score: number
        snippet: string
    }>
}

export interface PowerAlarmData {
    [key: string]: string | number;
}
export interface ChatThread {
    id: string
    thread_id: string
    title: string
    type: string
    created_at: string
    updated_at: string
    message_count: number
}

export interface ChatProps {
    chatType?: string;
}