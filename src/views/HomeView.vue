<script setup>
import { ref, computed } from 'vue'
import { useItemStore } from '@/stores/items'
import { useRecordStore } from '@/stores/records'
import { useTechnicianStore } from '@/stores/technicians'
import { useConsumableStore } from '@/stores/consumables'
import { getUrgency, getReplaceUrgency } from '@/utils/date'
import { fmtMoney } from '@/utils/format'
import ReminderList from '@/components/reminder/ReminderList.vue'
import RecordForm from '@/components/record/RecordForm.vue'
import ReplaceConsumableModal from '@/components/consumable/ReplaceConsumableModal.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const itemStore = useItemStore()
const recordStore = useRecordStore()
const technicianStore = useTechnicianStore()
const consumableStore = useConsumableStore()

const showRecord = ref(false)
const presetItemId = ref('')
const replacingConsumable = ref(null)

const itemOverdue = computed(() => itemStore.items.filter((i) => getUrgency(i) === 'overdue').length)
const itemDueSoon = computed(() => itemStore.items.filter((i) => getUrgency(i) === 'dueSoon').length)
const consumableOverdue = computed(
  () => consumableStore.consumables.filter((c) => getReplaceUrgency(c) === 'overdue').length
)
const consumableDueSoon = computed(
  () => consumableStore.consumables.filter((c) => getReplaceUrgency(c) === 'dueSoon').length
)
const overdueCount = computed(() => itemOverdue.value + consumableOverdue.value)
const dueSoonCount = computed(() => itemDueSoon.value + consumableDueSoon.value)

const monthCost = computed(() => {
  const now = new Date()
  const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return recordStore.records
    .filter((r) => r.date && r.date.startsWith(m))
    .reduce((s, r) => s + (Number(r.cost) || 0), 0)
})

function openRecord(item) {
  presetItemId.value = item.id
  showRecord.value = true
}
function openNewRecord() {
  presetItemId.value = ''
  showRecord.value = true
}
function onSave(payload) {
  recordStore.addRecord(payload)
  showRecord.value = false
}
function onReplace(id, date) {
  consumableStore.markReplaced(id, date)
  replacingConsumable.value = null
}
</script>

<template>
  <div class="page">
    <section class="hero">
      <div>
        <h1 class="hero-title">欢迎回来</h1>
        <p class="hero-sub">今天有 {{ overdueCount + dueSoonCount }} 项需要关注</p>
      </div>
      <button class="btn btn-primary" @click="openNewRecord">+ 记录保养/维修</button>
    </section>

    <section class="stats">
      <div class="stat-card">
        <div class="stat-label">物品总数</div>
        <div class="stat-value">{{ itemStore.items.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">耗材总数</div>
        <div class="stat-value" style="color: var(--consumable-color, #ea580c)">
          {{ consumableStore.consumables.length }}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已过期</div>
        <div class="stat-value" style="color: #dc2626">{{ overdueCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">即将到期</div>
        <div class="stat-value" style="color: #d97706">{{ dueSoonCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月花费</div>
        <div class="stat-value accent">¥{{ fmtMoney(monthCost) }}</div>
      </div>
    </section>

    <section class="card">
      <h3>待保养 / 待更换提醒</h3>
      <ReminderList
        v-if="itemStore.items.length || consumableStore.consumables.length"
        :items="itemStore.items"
        :consumables="consumableStore.consumables"
        @maintain="openRecord"
        @replace="replacingConsumable = $event"
      />
      <EmptyState v-else title="还没有物品或耗材档案" desc="添加物品或登记耗材后，系统会自动生成保养 / 更换提醒">
        <div class="empty-actions">
          <router-link to="/items" class="btn btn-primary" style="margin-top: 12px">去添加物品</router-link>
          <router-link to="/consumables" class="btn btn-outline" style="margin-top: 12px">去登记耗材</router-link>
        </div>
      </EmptyState>
    </section>

    <BaseModal v-if="showRecord" title="记录保养 / 维修" @close="showRecord = false">
      <RecordForm
        :items="itemStore.items"
        :technicians="technicianStore.technicians"
        :preset-item-id="presetItemId"
        @save="onSave"
        @cancel="showRecord = false"
      />
    </BaseModal>

    <ReplaceConsumableModal
      v-if="replacingConsumable"
      :consumable="replacingConsumable"
      @replace="onReplace"
      @cancel="replacingConsumable = null"
    />
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary), #38a169);
  color: #fff;
  border-radius: 14px;
  padding: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.hero-title {
  font-size: 20px;
}
.hero-sub {
  margin: 4px 0 0;
  opacity: 0.9;
  font-size: 13px;
}
.hero .btn-primary {
  background: #fff;
  color: var(--primary);
  border-color: #fff;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.empty-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
