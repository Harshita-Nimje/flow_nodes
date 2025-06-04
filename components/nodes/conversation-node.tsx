"use client";

import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface ConversationNodeProps {
  data: {
    label: string;
    instruction?: string;
    isGlobal?: boolean;
    customLLM?: boolean;
  };
  selected: boolean;
}

export function ConversationNode({ data, selected }: ConversationNodeProps) {
  return (
    <Card
      className={`w-64 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 
        dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 shadow-lg transition-all ${
          selected ? "ring-2 ring-blue-500" : ""
        }`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 -mt-0.5">
            {data.label}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          {data.isGlobal && (
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded">
              🌍 Global
            </span>
          )}
          {data.customLLM && (
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded">
             🤖 Custom LLM
            </span>
          )}
        </div>
      </CardHeader>
      {data.instruction && (
        <CardContent className="p-4 pt-0 text-xl font-medium text-gray-700 dark:text-gray-300">
          {data.instruction}
        </CardContent>
      )}
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500"
      />
    </Card>
  );
}
