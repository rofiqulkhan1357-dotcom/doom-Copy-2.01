/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServoState {
  id: number;
  name: string;
  angle: number;
  speed: number;
  acceleration: number;
  minAngle: number;
  maxAngle: number;
}

export interface ArmModel {
  id: string;
  name: string;
  servos: ServoState[];
}

export interface SequenceStep {
  id: string;
  angles: number[]; // Array of 6 angles
  duration: number; // ms
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  steps: SequenceStep[];
}
