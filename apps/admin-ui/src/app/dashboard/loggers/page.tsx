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
  const [activeFilter, setActiveFilter] = useState<"all" | LogType>("all");

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

  const applyFilter = (type: "all" | LogType) => {
    setActiveFilter(type);
    if (type === "all") {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter((l) => l.type === type));
    }
    // Keep scroll pinned to bottom on filter change
    requestAnimationFrame(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "1") {
        applyFilter("error");
      } else if (e.key === "2") {
        applyFilter("success");
      } else if (e.key === "0") {
        applyFilter("all");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
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

  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
    setActiveFilter("all");
  };


  const counts = React.useMemo(() => {
    const base = { all: logs.length, success: 0, error: 0, info: 0, warning: 0, debug: 0 } as Record<"all" | LogType, number>;
    for (const l of logs) base[l.type]++;
    return base;
  }, [logs]);

  const FilterChip = ({ label, type }: { label: string; type: "all" | LogType }) => (
    <button
      onClick={() => applyFilter(type)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
        activeFilter === type
          ? "bg-[#ff8800] text-[#18181b] border-[#ff8800]"
          : "bg-[#18181b] text-gray-300 border-[#232326] hover:border-[#ff8800]"
      }`}
      aria-pressed={activeFilter === type}
    >
      <span>{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeFilter === type ? "bg-[#18181b] text-[#ff8800]" : "bg-[#232326] text-gray-300"}`}>
        {counts[type]}
      </span>
    </button>
  );

  const Row = ({ item }: { item: LogItem }) => (
    <div className="border-b border-[#232326] py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <span className="text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
          {item.source && <span className="hidden sm:inline text-gray-600">•</span>}
          {item.source && <span className="text-gray-300">{item.source}</span>}
          <span className="hidden sm:inline text-gray-600">•</span>
          <span className={`font-semibold uppercase tracking-wide ${typeColorMap[item.type]}`}>{item.type}</span>
        </div>
        <div className="sm:text-right text-gray-300 font-mono text-xs sm:text-sm break-words">{item.message}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-200">Loggers</h1>
          <p className="text-sm text-gray-400 mt-1">Live application logs. Use 0 = All, 1 = Errors, 2 = Success.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={clearLogs}
            className="px-3 sm:px-4 py-2 rounded-xl font-semibold bg-[#18181b] text-gray-200 hover:bg-[#232326] border border-[#232326] hover:border-[#ff8800]"
            title="Clear logs"
          >
            Clear
          </button>
          <button
            onClick={downloadLogs}
            className="px-3 sm:px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 bg-[#ff8800] text-[#18181b] hover:bg-[#ffa239]"
            title="Download logs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip label="All" type="all" />
          <FilterChip label="Errors" type="error" />
          <FilterChip label="Success" type="success" />
          <FilterChip label="Info" type="info" />
          <FilterChip label="Warning" type="warning" />
          <FilterChip label="Debug" type="debug" />
        </div>
      </div>

      {/* Log list */}
      <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl overflow-hidden">
        <div ref={logContainerRef} className="h-[60vh] sm:h-[70vh] overflow-y-auto px-4">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center p-12 text-center">
              <div>
                <div className="text-2xl font-semibold text-gray-300">No logs yet</div>
                <p className="text-gray-500 mt-2">Logs will appear here in real time.</p>
              </div>
            </div>
          ) : (
            filteredLogs.map((item, idx) => <Row key={idx} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}
