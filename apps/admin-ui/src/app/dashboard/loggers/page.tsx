"use client";

import React, {useEffect, useState, useRef} from "react";
import { Download } from "lucide-react";

type LogType = "success" | "error" | "info" | "warning" | "debug";

type LogItem = {
  type: LogType;
  message: string;
  source?: string;
  timestamp: string;
}

const typeColorMap: Record<LogType, string> = {
  success: "text-green-400",
  error: "text-red-500",
  info: "text-blue-400",
  warning: "text-yellow-400",
  debug: "text-gray-400",
}


export default function LoggersPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URI!);

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLogs((prev) => [...prev, parsed]);
      } catch (error) {
        console.error("Invalid log format: ", error);
      }
    }

    return () => socket.close()
  }, []);

  useEffect(() => {
    setFilteredLogs(logs);
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "1"){
        setFilteredLogs(logs.filter(log => log.type === "error"));
      }
      else if (e.key === "2"){
        setFilteredLogs(logs.filter(log => log.type === "success"));
      }
      else if (e.key === "0"){
        setFilteredLogs(logs);
      }
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    }
  }, [logs]);

  //Download logs as .log file
  const downloadLogs = () => {
    const content = filteredLogs.map((log) => `[${new Date(log.timestamp).toLocaleString()}] ${log.source} [${log.type.toUpperCase()}] ${log.message}`).join("\n");
    const blob = new Blob([content], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-logs.log`;
    a.click();
    URL.revokeObjectURL(url);
  }


  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-3xl font-bold text-[#ff8800]">Loggers</h1>
    </div>
  );
}
