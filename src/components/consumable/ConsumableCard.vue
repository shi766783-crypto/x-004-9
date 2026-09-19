<script setup>
import { computed } from 'vue'
import { daysUntilReplace, getConsumableUrgency } from '@/utils/date'

const props = defineProps({
  consumable: { type: Object, required: true },
  // 适配物品名称（由父级通过物品档案解析，可能为空）
  itemName: { type: String, default: '' }
})
const emit = defineEmits(['replace', 'edit', 'delete'])

const urgency = computed(() => getConsumableUrgency(props.consumable))
const days = computed(() => daysUntilReplace(props.consumable))

const urgencyText = computed(() => {
  const d = days.value
  if (urgency.value === 'overdue') return `已过期 ${Math.abs(d)} 天`
  if (urgency.value === 'dueSoon') return `${d} 天后到期`
  if (urgency.value === 'normal') return `${d} 天后到期`
  return '未登记更换日期'
})
</script>

<template>
  <div class="consumable-card" :class="urgency">
    <div class="main">
      <div class="top">
        <span class="dot"></span>
        <span class="name">{{ consumable.name }}</span>
        <span v-if="itemName" class="fit">适配：{{ itemName }}</span>
      </div>
      <div class="meta">
        <span class="status" :class="urgency">{{ urgencyText }}</span>
        <span class="muted">上次更换：{{ consumable.lastReplacedDate || '未记录' }}</span>
      </div>
    </div>
    <div class="ops">
      <button class="btn btn-sm btn-primary" @click="emit('replace', consumable)">记录更换</button>
      <button class="btn btn-sm" @click="emit('edit', consumable)">编辑</button>
      <button class="btn btn-sm btn-danger" @click="emit('delete', consumable)">删除</button>
    </div>
  </div>
</template>

<style scoped>
.consumable-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--border);
  border-left: 3px solid #e2e8f0;
  border-radius: 10px;
}
.consumable-card.overdue {
  border-left-color: #dc2626;
}
.consumable-card.dueSoon {
  border-left-color: #f59e0b;
}
.consumable-card.normal {
  border-left-color: #16a34a;
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
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
  background: #0891b2;
}
.name {
  font-weight: 600;
}
.fit {
  font-size: 12px;
  color: var(--text-muted);
}
.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
.status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
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
  font-weight: 400;
}
.ops {
  display: flex;
  gap: 6px;
  flex: none;
}
@media (max-width: 560px) {
  .consumable-card {
    flex-direction: column;
    align-items: stretch;
  }
  .ops {
    justify-content: flex-end;
  }
}
</style>
