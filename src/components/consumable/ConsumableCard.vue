<script setup>
import { computed } from 'vue'
import {
  daysUntilReplace,
  getReplaceUrgency,
  nextReplaceDate,
  URGENCY_LABEL
} from '@/utils/date'
import { CYCLE_UNITS } from '@/constants'

const props = defineProps({
  consumable: { type: Object, required: true },
  // 关联物品的名称（已关联物品时由父级传入）
  itemName: { type: String, default: '' }
})

const emit = defineEmits(['edit', 'remove', 'replace'])

const urgency = computed(() => getReplaceUrgency(props.consumable))
const days = computed(() => daysUntilReplace(props.consumable))
const due = computed(() => nextReplaceDate(props.consumable))
const unitLabel = computed(
  () => CYCLE_UNITS.find((u) => u.value === props.consumable.cycleUnit)?.label || ''
)

const target = computed(() => props.itemName || props.consumable.targetName || '')

const urgencyText = computed(() => {
  const d = days.value
  if (urgency.value === 'overdue') return `已过期 ${Math.abs(d)} 天`
  if (urgency.value === 'dueSoon') return `${d} 天后需更换`
  if (urgency.value === 'normal') return `${d} 天后更换`
  return URGENCY_LABEL.none
})
</script>

<template>
  <div class="con-card" :class="urgency">
    <div class="main">
      <div class="top">
        <span class="dot"></span>
        <span class="name">{{ consumable.name }}</span>
        <span v-if="target" class="target">适配：{{ target }}</span>
      </div>
      <div class="meta">
        <span class="status" :class="urgency">{{ urgencyText }}</span>
        <span class="cycle">每 {{ consumable.cycleValue }} {{ unitLabel }} 更换</span>
        <span class="date">上次：{{ consumable.lastReplacedDate || '—' }}</span>
        <span v-if="due" class="date">下次：{{ due }}</span>
      </div>
    </div>
    <div class="ops">
      <button class="btn btn-sm btn-primary" @click="emit('replace', consumable)">记录更换</button>
      <button class="btn btn-sm" @click="emit('edit', consumable)">编辑</button>
      <button class="btn btn-sm btn-danger" @click="emit('remove', consumable)">删除</button>
    </div>
  </div>
</template>

<style scoped>
.con-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--border);
  border-left: 3px solid #e2e8f0;
  border-radius: 10px;
  flex-wrap: wrap;
}
.con-card.overdue {
  border-left-color: #dc2626;
}
.con-card.dueSoon {
  border-left-color: #f59e0b;
}
.main {
  flex: 1;
  min-width: 0;
}
.top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
  background: var(--consumable-color, #ea580c);
}
.name {
  font-weight: 600;
}
.target {
  font-size: 12px;
  color: var(--text-muted);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}
.status {
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 6px;
}
.status.overdue {
  background: #fef2f2;
  color: #dc2626;
}
.status.dueSoon {
  background: #fffbeb;
  color: #d97706;
}
.status.normal {
  background: #f0fdf4;
  color: #16a34a;
}
.status.none {
  background: var(--bg-soft);
  color: var(--text-muted);
}
.ops {
  display: flex;
  gap: 6px;
  flex: none;
}
@media (max-width: 560px) {
  .ops {
    width: 100%;
  }
  .ops .btn {
    flex: 1;
  }
}
</style>
