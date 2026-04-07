import { useState, useEffect } from "react"

export function useSidebar() {
    const getPreference = () => {
        const saved = localStorage.getItem("sidebar_open")
        return saved ? JSON.parse(saved) : true
    }

    const [sidebarOpen, setSidebarOpen] = useState(getPreference())
    const [settingsOpen, setSettingsOpen] = useState(true)
    const [tableOpen, setTableOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem("sidebar_open", JSON.stringify(sidebarOpen))
    }, [sidebarOpen])

    return {
        sidebarOpen,
        setSidebarOpen,
        settingsOpen,
        setSettingsOpen,
        tableOpen,
        setTableOpen
    }
}