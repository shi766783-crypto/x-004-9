<script setup>
import { computed } from 'vue'

// 条目由 utils/reminders 的 buildReminders 统一生成并排序，
// 物品保养与耗材更换在这里无差别展示。
const props = defineProps({
  entries: { type: Array, required: true }
})

const emit = defineEmits(['action'])

const overdueCount = computed(() => props.entries.filter((s) => s.urgency === 'overdue').length)
const dueSoonCount = computed(() => props.entries.filter((s) => s.urgency === 'dueSoon').length)
</script>

<template>
  <div class="reminder-list">
    <div class="summary">
      <span class="chip danger">已过期 {{ overdueCount }}</span>
      <span class="chip warn">即将到期 {{ dueSoonCount }}</span>
    </div>

    <ul class="list">
      <li v-for="s in entries" :key="s.id" class="row" :class="s.urgency">
        <span class="dot" :style="{ background: s.color }"></span>
        <div class="main">
          <div class="name">
            {{ s.title }}
            <span class="cat">{{ s.tag }}</span>
            <span v-if="s.kind === 'consumable'" class="kind">耗材</span>
          </div>
          <div class="meta">
            <span class="urgency" :class="s.urgency">{{ s.urgencyLabel }}</span>
            <span v-if="s.dueLabel">{{ s.dueLabel }}</span>
            <span v-if="s.warrantyLabel" class="warranty" :class="s.warranty">
              {{ s.warrantyLabel }}
            </span>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" @click="emit('action', s)">{{ s.actionLabel }}</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
}
.chip.danger {
  background: #fef2f2;
  color: #dc2626;
}
.chip.warn {
  background: #fffbeb;
  color: #d97706;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid var(--border);
  border-left: 3px solid #e2e8f0;
  border-radius: 10px;
}
.row.overdue {
  border-left-color: #dc2626;
}
.row.dueSoon {
  border-left-color: #f59e0b;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
}
.main {
  flex: 1;
  min-width: 0;
}
.name {
  font-weight: 600;
}
.cat {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 6px;
}
.kind {
  font-size: 11px;
  color: #0891b2;
  background: #ecfeff;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}
.urgency {
  font-weight: 600;
}
.urgency.overdue {
  color: #dc2626;
}
.urgency.dueSoon {
  color: #d97706;
}
.warranty.expired {
  color: #dc2626;
}
.warranty.expiringSoon {
  color: #d97706;
}
.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
