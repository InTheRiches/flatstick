import type { PutterDoc, GripDoc } from "@/models/equipment"

export type Doc = PutterDoc | GripDoc | any

export function getDisplayName(doc: Doc): string {
  if (!doc) return ""

  // GripDoc has a name
  if ((doc as GripDoc).name) {
    return (doc as GripDoc).name
  }

  // PutterDoc may not have a name property if removed — build from brand + model
  const maybePutter = doc as PutterDoc
  if (maybePutter.brand || maybePutter.model) {
    const parts: string[] = []
    if (maybePutter.brand && maybePutter.brand.trim().length > 0) parts.push(maybePutter.brand.trim())
    if (maybePutter.model && maybePutter.model.trim().length > 0) parts.push(maybePutter.model.trim())
    if (parts.length > 0) return parts.join(" ")
  }

  // Last fallback: attempt to use id or empty
  return maybePutter.id ?? ""
}

