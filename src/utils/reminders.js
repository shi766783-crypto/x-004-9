// 提醒聚合：把"物品保养"与"耗材更换"两类来源归一化为同构的提醒条目，
// 首页提醒列表统一排序、展示，避免两类到期各自为政导致漏换。

import { categoryOf } from '@/constants'
import {
  daysUntilDue,
  daysUntilReplace,
  getUrgency,
  getConsumableUrgency,
  nextDueDate,
  nextReplaceDate,
  getWarrantyStatus,
  URGENCY_ORDER,
  URGENCY_LABEL,
  WARRANTY_LABEL
} from '@/utils/date'

// 耗材条目统一使用的标识色（青色，区别于物品分类色）
export const CONSUMABLE_COLOR = '#0891b2'

// 物品保养 → 提醒条目
export function itemReminder(item) {
  const urgency = getUrgency(item)
  const due = nextDueDate(item)
  const warranty = getWarrantyStatus(item)
  return {
    kind: 'item',
    id: item.id,
    refId: item.id,
    title: item.name,
    tag: categoryOf(item.category).label,
    color: categoryOf(item.category).color,
    urgency,
    urgencyLabel: URGENCY_LABEL[urgency],
    days: daysUntilDue(item),
    dueLabel: due ? `下次保养：${due}` : '',
    warranty,
    warrantyLabel: warranty !== 'none' ? WARRANTY_LABEL[warranty] : '',
    actionLabel: '去保养'
  }
}

// 耗材更换 → 提醒条目（itemName 由调用方通过物品档案解析）
export function consumableReminder(consumable, itemName = '') {
  const urgency = getConsumableUrgency(consumable)
  const due = nextReplaceDate(consumable)
  return {
    kind: 'consumable',
    id: `consumable:${consumable.id}`,
    refId: consumable.id,
    title: consumable.name,
    tag: itemName ? `适配：${itemName}` : '',
    color: CONSUMABLE_COLOR,
    urgency,
    urgencyLabel: urgency === 'none' ? '未登记更换日期' : URGENCY_LABEL[urgency],
    days: daysUntilReplace(consumable),
    dueLabel: due ? `下次更换：${due}` : '',
    warranty: 'none',
    warrantyLabel: '',
    actionLabel: '去更换'
  }
}

// 聚合两类来源并按 紧急程度 > 剩余天数 排序，与原物品提醒排序保持一致
export function buildReminders(items, consumables = [], itemNameOf = () => '') {
  const entries = [
    ...items.map(itemReminder),
    ...consumables.map((c) => consumableReminder(c, itemNameOf(c.itemId)))
  ]
  return entries.sort((a, b) => {
    if (URGENCY_ORDER[a.urgency] !== URGENCY_ORDER[b.urgency]) {
      return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
    }
    return (a.days ?? 0) - (b.days ?? 0)
  })
}
