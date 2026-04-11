/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ServoState } from "../types";

interface ArmVisualizerProps {
  servos: ServoState[];
  isRecording?: boolean;
}

export const ArmVisualizer: React.FC<ArmVisualizerProps> = ({ servos, isRecording }) => {
  // Simple 2D side-view SVG visualization
  // Base -> Shoulder -> Elbow -> Wrist -> Gripper
  
  const baseAngle = servos[0].angle; // Rotation (not easily shown in 2D side view, maybe top view?)
  const shoulderAngle = servos[1].angle;
  const elbowAngle = servos[2].angle;
  const wristPitch = servos[3].angle;
  const gripperAngle = servos[4].angle; // End effector

  // Lengths
  const L1 = 80; // Shoulder to Elbow
  const L2 = 70; // Elbow to Wrist
  const L3 = 40; // Wrist to Gripper

  // Origin
  const ox = 200;
  const oy = 350;

  // Calculate positions
  // We'll treat angles as relative to the previous segment
  const a1 = (shoulderAngle - 90) * (Math.PI / 180);
  const x1 = ox + L1 * Math.cos(a1);
  const y1 = oy + L1 * Math.sin(a1);

  const a2 = a1 + (elbowAngle - 90) * (Math.PI / 180);
  const x2 = x1 + L2 * Math.cos(a2);
  const y2 = y1 + L2 * Math.sin(a2);

  const a3 = a2 + (wristPitch - 90) * (Math.PI / 180);
  const x3 = x2 + L3 * Math.cos(a3);
  const y3 = y2 + L3 * Math.sin(a3);

  return (
    <div className="relative w-full h-[400px] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Real-time Telemetry</span>
          {isRecording && (
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">REC</span>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          {servos.map(s => (
            <div key={s.id} className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-600 uppercase">{s.name.split(' ')[0]}</span>
              <span className="text-xs font-mono text-zinc-300">{s.angle.toFixed(1)}°</span>
            </div>
          ))}
        </div>
      </div>

      <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Base */}
        <rect x={ox - 30} y={oy} width="60" height="20" fill="#27272a" rx="2" />
        <circle cx={ox} cy={oy} r="8" fill="#3f3f46" />

        {/* Segments */}
        <motion.line
          x1={ox} y1={oy}
          animate={{ x2: x1, y2: y1 }}
          stroke="#71717a"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.line
          animate={{ x1: x1, y1: y1, x2: x2, y2: y2 }}
          stroke="#a1a1aa"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <motion.line
          animate={{ x1: x2, y1: y1, x2: x3, y2: y3 }}
          stroke="#d4d4d8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Joints */}
        <motion.circle animate={{ cx: x1, cy: y1 }} r="6" fill="#52525b" stroke="#18181b" strokeWidth="2" />
        <motion.circle animate={{ cx: x2, cy: y2 }} r="5" fill="#71717a" stroke="#18181b" strokeWidth="2" />
        <motion.circle animate={{ cx: x3, cy: y3 }} r="4" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />

        {/* End Effector (Gripper) */}
        <motion.g animate={{ x: x3, y: y3, rotate: a3 * (180/Math.PI) + 90 }}>
           <path d="M -10 0 L -10 15 M 10 0 L 10 15" stroke="#f4f4f5" strokeWidth="2" />
        </motion.g>
      </svg>
      
      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-600 uppercase">
        Axis: X-Y Projection
      </div>
    </div>
  );
};
