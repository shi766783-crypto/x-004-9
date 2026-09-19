<script setup>
import { ref, computed } from 'vue'
import { useConsumableStore } from '@/stores/consumables'
import { useItemStore } from '@/stores/items'
import { getConsumableUrgency } from '@/utils/date'
import ConsumableCard from '@/components/consumable/ConsumableCard.vue'
import ConsumableForm from '@/components/consumable/ConsumableForm.vue'
import ReplaceForm from '@/components/consumable/ReplaceForm.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const consumableStore = useConsumableStore()
const itemStore = useItemStore()

const keyword = ref('')
const itemFilter = ref('')
const showForm = ref(false)
const showReplace = ref(false)
const editing = ref(null)
const replacing = ref(null)

const filtered = computed(() => {
  return consumableStore.consumables.filter((c) => {
    const kw = keyword.value.trim().toLowerCase()
    const fitName = itemStore.itemById(c.itemId)?.name || ''
    const matchKw =
      !kw || (c.name + fitName + (c.notes || '')).toLowerCase().includes(kw)
    const matchItem = !itemFilter.value || c.itemId === itemFilter.value
    return matchKw && matchItem
  })
})

const overdueCount = computed(
  () => consumableStore.consumables.filter((c) => getConsumableUrgency(c) === 'overdue').length
)
const dueSoonCount = computed(
  () => consumableStore.consumables.filter((c) => getConsumableUrgency(c) === 'dueSoon').length
)

function itemNameOf(id) {
  return itemStore.itemById(id)?.name || ''
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
}
function openReplace(c) {
  replacing.value = c
  showReplace.value = true
}
function onReplace(date) {
  consumableStore.markReplaced(replacing.value.id, date)
  showReplace.value = false
}
function onDelete(c) {
  if (!confirm(`确定删除耗材「${c.name}」吗？`)) return
  consumableStore.removeConsumable(c.id)
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">耗材登记</h1>
        <p class="page-sub">
          滤芯、电池等定期更换的耗材，到期会自动出现在首页提醒里
        </p>
      </div>
      <button class="btn btn-primary" @click="openAdd">+ 登记耗材</button>
    </div>

    <div v-if="consumableStore.consumables.length" class="summary">
      <span class="chip danger">已过期 {{ overdueCount }}</span>
      <span class="chip warn">即将到期 {{ dueSoonCount }}</span>
      <span class="chip">共 {{ consumableStore.consumables.length }} 项</span>
    </div>

    <div class="toolbar">
      <input v-model="keyword" class="input grow" placeholder="搜索耗材名称 / 适配物品 / 备注" />
      <select v-model="itemFilter" class="input" style="max-width: 160px">
        <option value="">全部物品</option>
        <option v-for="i in itemStore.items" :key="i.id" :value="i.id">{{ i.name }}</option>
      </select>
    </div>

    <div v-if="filtered.length" class="list">
      <ConsumableCard
        v-for="c in filtered"
        :key="c.id"
        :consumable="c"
        :item-name="itemNameOf(c.itemId)"
        @replace="openReplace"
        @edit="openEdit"
        @delete="onDelete"
      />
    </div>
    <EmptyState
      v-else
      title="还没有登记耗材"
      desc="登记滤芯、电池等耗材的更换周期，到期自动提醒，不再靠脑子记"
    >
      <button class="btn btn-primary" style="margin-top: 12px" @click="openAdd">立即登记</button>
    </EmptyState>

    <BaseModal
      v-if="showForm"
      :title="editing ? '编辑耗材' : '登记耗材'"
      @close="showForm = false"
    >
      <ConsumableForm
        :consumable="editing"
        :items="itemStore.items"
        @save="onSave"
        @cancel="showForm = false"
      />
    </BaseModal>

    <BaseModal v-if="showReplace" title="记录耗材更换" @close="showReplace = false">
      <ReplaceForm
        :consumable="replacing"
        @save="onReplace"
        @cancel="showReplace = false"
      />
    </BaseModal>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bg-soft);
  color: var(--text-muted);
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
