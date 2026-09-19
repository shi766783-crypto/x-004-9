<script setup>
import { ref, computed } from 'vue'
import { useItemStore } from '@/stores/items'
import { useConsumableStore } from '@/stores/consumables'
import { getReplaceUrgency } from '@/utils/date'
import ConsumableCard from '@/components/consumable/ConsumableCard.vue'
import ConsumableForm from '@/components/consumable/ConsumableForm.vue'
import ReplaceConsumableModal from '@/components/consumable/ReplaceConsumableModal.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const itemStore = useItemStore()
const consumableStore = useConsumableStore()

const keyword = ref('')
const status = ref('')
const showForm = ref(false)
const editing = ref(null)
const replacing = ref(null)

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'overdue', label: '已过期' },
  { value: 'dueSoon', label: '即将到期' },
  { value: 'normal', label: '正常' }
]

const listed = computed(() =>
  consumableStore.consumables
    .map((c) => ({ c, urgency: getReplaceUrgency(c) }))
    .filter(({ c, urgency }) => {
      const kw = keyword.value.trim().toLowerCase()
      const target = itemStore.itemById(c.itemId)?.name || c.targetName || ''
      const matchKw = !kw || (c.name + target).toLowerCase().includes(kw)
      const matchStatus = !status.value || urgency === status.value
      return matchKw && matchStatus
    })
    .sort((a, b) => {
      const order = { overdue: 0, dueSoon: 1, normal: 2, none: 3 }
      return order[a.urgency] - order[b.urgency]
    })
    .map((x) => x.c)
)

function itemNameOf(c) {
  return itemStore.itemById(c.itemId)?.name || ''
}

function openAdd() {
  editing.value = null
  showForm.value = true
}
function openEdit(c) {
  editing.value = c
  showForm.value = true
}
function onSave(payload) {
  if (editing.value) {
    consumableStore.updateConsumable(editing.value.id, payload)
  } else {
    consumableStore.addConsumable(payload)
  }
  showForm.value = false
  editing.value = null
}
function onRemove(c) {
  if (!confirm(`确定删除耗材「${c.name}」吗？`)) return
  consumableStore.removeConsumable(c.id)
}
function onReplace(id, date) {
  consumableStore.markReplaced(id, date)
  replacing.value = null
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">耗材登记</h1>
        <p class="page-sub">滤芯、电池等定期更换的耗材，到期会自动出现在首页提醒里</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">+ 登记耗材</button>
    </div>

    <div class="toolbar">
      <input v-model="keyword" class="input grow" placeholder="搜索耗材 / 适配物品" />
      <select v-model="status" class="input" style="max-width: 140px">
        <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <div v-if="listed.length" class="list">
      <ConsumableCard
        v-for="c in listed"
        :key="c.id"
        :consumable="c"
        :item-name="itemNameOf(c)"
        @edit="openEdit"
        @remove="onRemove"
        @replace="replacing = $event"
      />
    </div>
    <EmptyState
      v-else
      title="还没有耗材档案"
      desc="登记第一个耗材，下次该换滤芯 / 电池时就不会忘了"
    />

    <BaseModal :title="editing ? '编辑耗材' : '登记耗材'" @close="showForm = false">
      <ConsumableForm
        v-if="showForm"
        :consumable="editing"
        :items="itemStore.items"
        @save="onSave"
        @cancel="showForm = false"
      />
    </BaseModal>

    <ReplaceConsumableModal
      v-if="replacing"
      :consumable="replacing"
      @replace="onReplace"
      @cancel="replacing = null"
    />
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
