/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArmModel, Routine } from "./types";

export const DEFAULT_ARM_MODELS: ArmModel[] = [
  {
    id: "standard-6-axis",
    name: "Standard 6-Axis Industrial",
    servos: [
      { id: 0, name: "Base (Rotation)", angle: 90, speed: 50, acceleration: 20, minAngle: 0, maxAngle: 180 },
      { id: 1, name: "Shoulder (Pitch)", angle: 45, speed: 40, acceleration: 15, minAngle: 0, maxAngle: 180 },
      { id: 2, name: "Elbow (Pitch)", angle: 135, speed: 40, acceleration: 15, minAngle: 0, maxAngle: 180 },
      { id: 3, name: "Wrist Pitch", angle: 90, speed: 60, acceleration: 30, minAngle: 0, maxAngle: 180 },
      { id: 4, name: "Wrist Roll", angle: 90, speed: 80, acceleration: 40, minAngle: 0, maxAngle: 180 },
      { id: 5, name: "Gripper", angle: 0, speed: 100, acceleration: 50, minAngle: 0, maxAngle: 180 },
    ],
  },
  {
    id: "lightweight-cobot",
    name: "Lightweight Cobot",
    servos: [
      { id: 0, name: "Base", angle: 90, speed: 30, acceleration: 10, minAngle: 0, maxAngle: 180 },
      { id: 1, name: "Joint 1", angle: 90, speed: 30, acceleration: 10, minAngle: 0, maxAngle: 180 },
      { id: 2, name: "Joint 2", angle: 90, speed: 30, acceleration: 10, minAngle: 0, maxAngle: 180 },
      { id: 3, name: "Joint 3", angle: 90, speed: 30, acceleration: 10, minAngle: 0, maxAngle: 180 },
      { id: 4, name: "Joint 4", angle: 90, speed: 30, acceleration: 10, minAngle: 0, maxAngle: 180 },
      { id: 5, name: "End Effector", angle: 90, speed: 30, acceleration: 10, minAngle: 0, maxAngle: 180 },
    ],
  }
];

export const PREMADE_ROUTINES: Routine[] = [
  {
    id: "home-position",
    name: "Home Position",
    description: "Returns the arm to its default neutral state.",
    steps: [
      { id: "step-1", angles: [90, 45, 135, 90, 90, 0], duration: 1000 }
    ]
  },
  {
    id: "wave-hello",
    name: "Wave Hello",
    description: "A friendly waving motion.",
    steps: [
      { id: "w1", angles: [90, 90, 90, 60, 90, 0], duration: 500 },
      { id: "w2", angles: [90, 90, 90, 120, 90, 0], duration: 500 },
      { id: "w3", angles: [90, 90, 90, 60, 90, 0], duration: 500 },
      { id: "w4", angles: [90, 90, 90, 120, 90, 0], duration: 500 },
      { id: "w5", angles: [90, 45, 135, 90, 90, 0], duration: 500 },
    ]
  },
  {
    id: "pick-and-place",
    name: "Pick & Place Demo",
    description: "Demonstrates a basic pick and place sequence.",
    steps: [
      { id: "p1", angles: [45, 45, 135, 90, 90, 0], duration: 800 },
      { id: "p2", angles: [45, 90, 160, 90, 90, 0], duration: 800 },
      { id: "p3", angles: [45, 90, 160, 90, 90, 180], duration: 400 },
      { id: "p4", angles: [45, 45, 135, 90, 90, 180], duration: 800 },
      { id: "p5", angles: [135, 45, 135, 90, 90, 180], duration: 800 },
      { id: "p6", angles: [135, 90, 160, 90, 90, 180], duration: 800 },
      { id: "p7", angles: [135, 90, 160, 90, 90, 0], duration: 400 },
      { id: "p8", angles: [90, 45, 135, 90, 90, 0], duration: 800 },
    ]
  }
];
