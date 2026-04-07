import InputArea from "../components/InputArea";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatArea from "../components/ChatArea";
import { useChatAPI } from "../hooks/useChatApi";
import type { ChatProps, Message, PowerAlarmData } from "../types";

const POWER_ALARM_DATA: PowerAlarmData[] = [
  { District: "Bagerhat", ActivePowerAlarms: "11" },
  { District: "Bandarban", ActivePowerAlarms: "1" },
];

function getSidebarPreference(): boolean {
  const saved = localStorage.getItem("sidebar_open");
  return saved !== null ? JSON.parse(saved) : true;
}

function setSidebarPreference(isOpen: boolean) {
  localStorage.setItem("sidebar_open", JSON.stringify(isOpen));
}

export default function Chat({ chatType = "general" }: ChatProps) {
  const { threadId } = useParams<{ threadId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentThreadId, setCurrentThreadIdState] = useState<string | null>(
    null,
  );
  const [sideBarData, setDataBarData] = useState(POWER_ALARM_DATA);
  const [sidebarOpen, setSidebarOpen] = useState(getSidebarPreference());
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(true);
  const [tableSidebarOpen, setTableSidebarOpen] = useState(false);
  const [sapData, setSapData] = useState([]);
  const navigate = useNavigate();
  const inputAreaRef = useRef<any>(null);

  const {
    createChat,
    sendMessage,
    getMessages,
    loading: apiLoading,
    userId,
  } = useChatAPI();

  useEffect(() => {
    if (threadId) {
      console.log("ThreadId from URL:", threadId);
      setCurrentThreadIdState(threadId);
      loadMessages(threadId);
    } else {
      console.log("No threadId in URL, clearing messages");
      setCurrentThreadIdState(null);
      setMessages([]);
    }
  }, [threadId]);

  // Save sidebar preference when it changes
  useEffect(() => {
    setSidebarPreference(sidebarOpen);
  }, [sidebarOpen]);

  const loadMessages = async (threadId: string) => {
    try {
      console.log("Loading messages for thread:", threadId);
      const data = await getMessages(threadId);
      console.log("Loaded messages:", data.messages);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  const createNewChat = async (firstMessage: string) => {
    try {
      const data = await createChat(firstMessage);
      navigate("/commercial-ai");
      console.log(data, "data in chat file ");
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: data.analysis,
        data: data.results?.data || [],
        sql_query: data.results?.sql_query,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      //   setMessages(data.analysis);
      return messages;
      // Update chatThreads optimistically with the new thread
      // const newThread: ChatThread = {
      //     id: data.thread_id,
      //     thread_id: data.thread_id,
      //     title: data.title,
      //     type: chatType,
      //     created_at: new Date().toISOString(),
      //     updated_at: new Date().toISOString(),
      //     message_count: 0
      // }
      // setChatThreads((prev) => [newThread, ...prev])

      // return data.thread_id
    } catch (error) {
      console.error("Error creating new chat:", error);
      throw error;
    }
  };

  const onSendMessage = async (text: string) => {
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
console.log('in send msg ');

    try {
      if (chatType === "sap-data") {
        if (currentThreadId) {
          await sendMessageToExistingThread(currentThreadId, text);
        } else {
          const sapResult = await querySapData(text);
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: sapResult.response,
            sql_query: sapResult.sql_query,
            data: sapResult.data || [],
          };
          setMessages((prev) => [...prev, assistantMsg]);
          if (sapResult.data && Array.isArray(sapResult.data)) {
            setSapData(sapResult?.data);
          }
          await createNewChat(text);
        }
      } else if (chatType === "doa") {
        // DOA chat handling - same flow as other chat types
        if (currentThreadId) {
          await sendMessageToExistingThread(currentThreadId, text);
        } else {
          await createNewChat(text);
        }
      } else {
        // Regular chat flow for general and commercial-ai
        if (currentThreadId) {
          await sendMessageToExistingThread(currentThreadId, text);
        } else {
          await createNewChat(text);
        }
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== userMsg.id));
      console.error("Error sending message:", error);

      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry, I encountered an error while processing your request. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsClick = () => {
    setSettingsSidebarOpen(true);
  };

  const onOpenModal = (type: "table" | "chart") => {
    if (type === "table") {
      setTableSidebarOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-[#E5EBF1]">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Area and Input */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <ChatArea
            messages={messages}
            onOpenModal={onOpenModal}
            chatType={chatType}
            setDataBarData={setDataBarData}
          />
          <InputArea
            ref={inputAreaRef}
            onSendMessage={onSendMessage}
            loading={loading}
            onSettingsClick={handleSettingsClick}
          />
        </div>
      </div>
    </div>
  );
}
