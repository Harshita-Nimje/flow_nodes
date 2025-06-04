"use client";

import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  TypeIcon as FunctionIcon,
  PhoneForwarded,
  Hash,
  Square,
  Download,
} from "lucide-react";
import type { NodeType } from "@/types/flow";
import type { FlowNode } from "@/types/flow";
import type { Edge } from "reactflow";

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
  nodes: FlowNode[];
  edges: Edge[];
}

export function NodePalette({ onAddNode, nodes, edges }: NodePaletteProps) {
  const nodeTypes = [
    { type: "conversation", icon: MessageCircle, label: "Conversation" },
    { type: "function", icon: FunctionIcon, label: "Function" },
    { type: "callTransfer", icon: PhoneForwarded, label: "Call Transfer" },
    { type: "pressDigit", icon: Hash, label: "Press Digit" },
    { type: "ending", icon: Square, label: "Ending" },
  ] as const;

  const handleExport = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "flow-export.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col p-6 gap-6 shadow-lg rounded-tr-lg rounded-br-lg select-none">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight ml-8">
        Flow Nodes
      </h2>

      <nav className="flex flex-col gap-3" aria-label="Add flow nodes">
        {nodeTypes.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            variant="ghost"
            onClick={() => onAddNode(type)}
            className="justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            aria-label={`Add ${label} node`}
            title={`Add ${label} node`}
          >
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-base font-medium">{label}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
}

