import { useAuth } from "../../../contexts/authContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useChatAPI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = user?.userId;
  const API_URL = import.meta.env.VITE_API_BASE_URL || "";

  // const getChats = async (chatType: string = "general") => {
  //     try {
  //         const response = await fetch(
  //             `/api/users/${userId}/chats?chat_type=${chatType}`,
  //             {
  //                 method: "GET",
  //                 credentials: "include",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 }
  //             }
  //         )

  //         if (!response.ok) {
  //             throw new Error(`Failed to fetch chats: ${response.statusText}`)
  //         }

  //         const data = await response.json()
  //         return data
  //     } catch (error) {
  //         console.error("Error fetching chats:", error)
  //         throw error
  //     }
  // }

  // const createChat = async (firstMessage: string, title?: string, chatType: string = "general") => {
  //     try {
  //         const response = await fetch(
  //             `/api/users/${userId}/chats`,
  //             {
  //                 method: "POST",
  //                 credentials: "include",
  //                 headers: {
  //                     "Content-Type": "application/json"
  //                 },
  //                 body: JSON.stringify({
  //                     user_query: firstMessage,
  //                     user_email: title || "",
  //                     type: chatType
  //                 })
  //             }
  //         )

  //         if (!response.ok) {
  //             throw new Error(`Failed to create chat: ${response.statusText}`)
  //         }

  //         const data = await response.json()
  //         return data
  //     } catch (error) {
  //         console.error("Error creating chat:", error)
  //         throw error
  //     }
  // }
  const createChat = async (firstMessage: string, title?: string) => {
    try {
      //  fetch(`${API_URL}/api/chat/stream`, {
      // const response = await  fetch(`${API_URL}/api/v1/finance_query`, {
      // fetch("https://bravus-finance-poc.azurewebsites.net/api/v1/finance_query", {
      const response = await fetch(
        "https://bravus-finance-poc.azurewebsites.net/api/v1/finance_query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_query: firstMessage,
            user_email: "sumeetmaheshwari@atqor.com",
          }),
        },
      );

      // if (!response.ok) {
      //   throw new Error(`Failed to create chat: ${response.statusText}`);
      // }
      console.log("error in crate chat ");

      const data = await response.json();
      console.log(data, "data");

      return {
        analysis: data.analysis,
        results: data.results,
        value: Number(
          data.results?.data?.[0]?.forecasted_sales_revenue_usd || 0,
        ),
      };
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  };

  const sendMessage = async (
    threadId: string,
    message: string,
    chatType: string = "general",
  ) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/chats/${threadId}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            type: chatType,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const getMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/chats/${threadId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  };

  return {
    createChat,
    // getChats,
    sendMessage,
    getMessages,
    loading,
    userId,
  };
}
