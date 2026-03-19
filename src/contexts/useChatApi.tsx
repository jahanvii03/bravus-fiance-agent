import { useAuth } from '../contexts/authContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useChatAPI() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const userId = user?.userId;

    const getChats = async (chatType: string = "general") => {
        try {
            const response = await fetch(
                `/api/users/${userId}/chats?chat_type=${chatType}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`Failed to fetch chats: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error("Error fetching chats:", error)
            throw error
        }
    }

    const createChat = async (firstMessage: string, title?: string, chatType: string = "general") => {
        try {
            const response = await fetch(
                `/api/users/${userId}/chats`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        first_message: firstMessage,
                        title: title || "",
                        type: chatType
                    })
                }
            )

            if (!response.ok) {
                throw new Error(`Failed to create chat: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error("Error creating chat:", error)
            throw error
        }
    }

    const sendMessage = async (threadId: string, message: string, chatType: string = "general") => {
        try {
            const response = await fetch(
                `/api/users/${userId}/chats/${threadId}/messages`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: message,
                        type: chatType
                    })
                }
            )

            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error("Error sending message:", error)
            throw error
        }
    }

    const getMessages = async (threadId: string) => {
        try {
            const response = await fetch(
                `/api/users/${userId}/chats/${threadId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`Failed to fetch messages: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error("Error fetching messages:", error)
            throw error
        }
    }

    return {
        createChat,
        getChats,
        sendMessage,
        getMessages,
        loading,
        userId
    }
}