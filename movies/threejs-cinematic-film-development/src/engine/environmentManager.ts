import * as THREE from 'three';
import type { EnvKey } from '../story/types';
import type { EnvBuilder, EnvInstance } from '../environments/common';
import { buildCity } from '../environments/city';
import { buildHighway } from '../environments/highway';
import { buildSupermarket } from '../environments/supermarket';
import { buildHospital } from '../environments/hospital';
import { buildVillage } from '../environments/village';
import { buildBridge } from '../environments/bridge';
import { buildFacility } from '../environments/facility';
import { buildStation } from '../environments/station';
import { buildMonitor } from '../environments/monitor';
import { disposeTree } from './props';

const BUILDERS: Record<EnvKey, EnvBuilder> = {
  city: buildCity, highway: buildHighway, supermarket: buildSupermarket, hospital: buildHospital, village: buildVillage,
  bridge: buildBridge, facility: buildFacility, station: buildStation, monitor: buildMonitor,
};

/** Builds one environment at a time (reusing it across consecutive scenes) and disposes the previous one. */
export class EnvironmentManager {
  private cur: { key: string; inst: EnvInstance } | null = null;
  constructor(private scene: THREE.Scene) {}

  set(env: EnvKey, mode?: string) {
    const key = `${env}:${mode ?? ''}`;
    if (this.cur?.key === key) return false;
    this.clear();
    const inst = BUILDERS[env](mode ?? '');
    this.scene.add(inst.group);
    this.cur = { key, inst };
    return true;
  }
  update(t: number, params: Record<string, number> | undefined, dt: number) {
    if (!this.cur) return;
    const p = params ?? {};
    this.cur.inst.update(t + (p.tOff ?? 0), p, dt);
  }
  get colliders() { return this.cur?.inst.colliders ?? []; }
  clear() {
    if (!this.cur) return;
    this.scene.remove(this.cur.inst.group);
    disposeTree(this.cur.inst.group);
    this.cur = null;
  }
}
