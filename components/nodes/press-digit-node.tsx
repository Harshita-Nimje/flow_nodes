"use client";

import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Hash } from "lucide-react";

interface PressDigitNodeProps {
  data: {
    label: string;
    instruction?: string;
    pauseDelay?: number;
    isGlobal?: boolean;
    customLLM?: boolean;
  };
  selected: boolean;
}

export function PressDigitNode({ data, selected }: PressDigitNodeProps) {
  return (
    <Card
      className={`w-64 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 
        dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 shadow-lg transition-all ${
          selected ? "ring-2 ring-blue-500" : ""
        }`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 -mt-0.5">
            {data.label}
          </span>
        </div>
        {(data.isGlobal || data.customLLM) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.isGlobal && (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100 font-medium px-2 py-0.5 rounded-md">
                🌍 Global
              </span>
            )}
            {data.customLLM && (
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100 font-medium px-2 py-0.5 rounded-md">
                🤖 Custom LLM
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {(data.instruction || data.pauseDelay) && (
        <CardContent className="p-4 pt-1 text-xs text-gray-700 dark:text-gray-300 font-medium leading-snug space-y-1">
          {data.instruction && <div>{data.instruction}</div>}
          {data.pauseDelay !== undefined && (
            <div className="font-normal">
              ⏱ Pause Delay: {data.pauseDelay}ms
            </div>
          )}
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

