<script setup>
import { computed } from 'vue'
import { categoryOf, CONSUMABLE_COLOR } from '@/constants'
import { useItemStore } from '@/stores/items'
import {
  daysUntilDue,
  daysUntilReplace,
  getUrgency,
  getReplaceUrgency,
  nextDueDate,
  nextReplaceDate,
  getWarrantyStatus,
  URGENCY_ORDER,
  URGENCY_LABEL,
  WARRANTY_LABEL
} from '@/utils/date'

const props = defineProps({
  items: { type: Array, required: true },
  consumables: { type: Array, default: () => [] }
})

const emit = defineEmits(['maintain', 'replace'])

const itemStore = useItemStore()

// 耗材的适配物品名：优先取关联物品，其次取手动填写
function targetNameOf(c) {
  return itemStore.itemById(c.itemId)?.name || c.targetName || ''
}

// 物品保养提醒与耗材更换提醒合并，按紧急程度（同级按剩余天数）统一排序
const sorted = computed(() => {
  const itemRows = props.items.map((item) => {
    const urgency = getUrgency(item)
    return {
      key: `item-${item.id}`,
      kind: 'item',
      ref: item,
      urgency,
      days: daysUntilDue(item),
      due: nextDueDate(item),
      warranty: getWarrantyStatus(item)
    }
  })
  const consumableRows = props.consumables.map((consumable) => {
    const urgency = getReplaceUrgency(consumable)
    return {
      key: `con-${consumable.id}`,
      kind: 'consumable',
      ref: consumable,
      urgency,
      days: daysUntilReplace(consumable),
      due: nextReplaceDate(consumable),
      warranty: 'none'
    }
  })
  return [...itemRows, ...consumableRows]
    .filter((r) => r.urgency !== 'none')
    .sort((a, b) => {
      if (URGENCY_ORDER[a.urgency] !== URGENCY_ORDER[b.urgency]) {
        return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
      }
      return (a.days ?? 0) - (b.days ?? 0)
    })
})

const overdueCount = computed(() => sorted.value.filter((s) => s.urgency === 'overdue').length)
const dueSoonCount = computed(() => sorted.value.filter((s) => s.urgency === 'dueSoon').length)
</script>

<template>
  <div class="reminder-list">
    <div class="summary">
      <span class="chip danger">已过期 {{ overdueCount }}</span>
      <span class="chip warn">即将到期 {{ dueSoonCount }}</span>
    </div>

    <div v-if="!sorted.length" class="hint">暂无到期事项，一切正常。</div>

    <ul class="list">
      <li v-for="s in sorted" :key="s.key" class="row" :class="s.urgency">
        <span
          class="dot"
          :style="{
            background: s.kind === 'consumable' ? CONSUMABLE_COLOR : categoryOf(s.ref.category).color
          }"
        ></span>
        <div class="main">
          <div class="name">
            {{ s.ref.name }}
            <span v-if="s.kind === 'consumable'" class="cat con-tag">耗材更换</span>
            <span v-else class="cat">{{ categoryOf(s.ref.category).label }}保养</span>
          </div>
          <div class="meta">
            <span class="urgency" :class="s.urgency">{{ URGENCY_LABEL[s.urgency] }}</span>
            <span v-if="s.due">
              {{ s.kind === 'consumable' ? '下次更换' : '下次保养' }}：{{ s.due }}
            </span>
            <span
              v-if="s.kind === 'consumable'"
              class="cat"
            >适配：{{ targetNameOf(s.ref) || '—' }}</span>
            <span v-if="s.warranty !== 'none'" class="warranty" :class="s.warranty">
              {{ WARRANTY_LABEL[s.warranty] }}
            </span>
          </div>
        </div>
        <button
          v-if="s.kind === 'consumable'"
          class="btn btn-sm btn-primary"
          @click="emit('replace', s.ref)"
        >
          去更换
        </button>
        <button v-else class="btn btn-sm btn-primary" @click="emit('maintain', s.ref)">
          去保养
        </button>
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
.hint {
  color: var(--text-muted);
  font-size: 13px;
  padding: 12px 0;
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
.con-tag {
  color: var(--consumable-color, #ea580c);
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
