import { z } from "zod";

/**
 * ノードンの種類を定義
 * 今後「演算」「センサー」などを追加する際の拡張性を確保
 */
export const NondonTypeSchema = z.enum([
  "button",
  "stick",
  "person",
  "constant",
  "memo",
  "timer",
]);

export type NondonType = z.infer<typeof NondonTypeSchema>;

/**
 * 入出力ポートの定義
 */
export const PortSchema = z.object({
  id: z.string(),
  name: z.string(),
  direction: z.enum(["input", "output"]),
  portType: z.enum(["logic", "link"]).default("logic"),
  color: z.string().default("#ffffff"),
  offset: z.tuple([z.number(), z.number(), z.number()]),
});

export type Port = z.infer<typeof PortSchema>;

/**
 * ノードン（メモ）の本体定義
 */
export const NondonSchema = z.object({
  id: z.string(),
  type: NondonTypeSchema,
  title: z.string(),
  memo: z.string(),
  /**
   * [x, y, z] 座標
   * Three.jsのVector3ではなく数値配列にすることで、
   * JSON.stringify() でそのまま保存可能（永続化に有利）にしている
   */
  position: z.tuple([z.number(), z.number(), z.number()]),
  /**
   * [width, height, depth] サイズ
   */
  size: z.tuple([z.number(), z.number(), z.number()]).default([1, 1, 1]),
  ports: z.array(PortSchema),
});

export type Nondon = z.infer<typeof NondonSchema>;

/**
 * 結線（ワイヤー）の定義
 */
export const ConnectionSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  fromPortId: z.string(),
  toNodeId: z.string(),
  toPortId: z.string(),
});

export type Connection = z.infer<typeof ConnectionSchema>;

/**
 * アプリ全体のデータ状態
 */
export const GlobalStateSchema = z.object({
  nodes: z.array(NondonSchema),
  connections: z.array(ConnectionSchema),
  selectedNodeId: z.string().nullable(),
  connectingPort: z
    .object({
      nodeId: z.string(),
      portId: z.string(),
    })
    .nullable()
    .default(null),
  editingAxis: z.enum(["Y", "Z"]),
  transformMode: z.enum(["translate", "scale"]),
});

export type GlobalState = z.infer<typeof GlobalStateSchema>;
