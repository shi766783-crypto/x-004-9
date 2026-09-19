<script setup>
import { reactive } from 'vue'
import { CYCLE_UNITS } from '@/constants'
import { todayStr } from '@/utils/date'

const props = defineProps({
  consumable: { type: Object, default: null },
  // 可选物品列表，用于关联"适配的物品"
  items: { type: Array, default: () => [] },
  // 打开表单时预选的物品（从物品详情页登记耗材时带入）
  presetItemId: { type: String, default: '' }
})
const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  name: props.consumable?.name || '',
  itemId: props.consumable?.itemId || props.presetItemId || '',
  targetName: props.consumable?.targetName || '',
  lastReplacedDate: props.consumable?.lastReplacedDate || todayStr(),
  cycleValue: props.consumable?.cycleValue ?? 3,
  cycleUnit: props.consumable?.cycleUnit || 'month',
  notes: props.consumable?.notes || ''
})

function submit() {
  if (!form.name.trim()) {
    alert('请填写耗材名称')
    return
  }
  if (!form.lastReplacedDate) {
    alert('请选择上次更换日期')
    return
  }
  emit('save', {
    ...form,
    name: form.name.trim(),
    itemId: form.itemId,
    targetName: form.itemId ? '' : form.targetName.trim(),
    cycleValue: Number(form.cycleValue) || 1
  })
}
</script>

<template>
  <form class="consumable-form" @submit.prevent="submit">
    <div class="field">
      <label class="label">耗材名称 <em>*</em></label>
      <input v-model="form.name" class="input" placeholder="例如：净水机滤芯、空调遥控器电池" />
    </div>

    <div class="field">
      <label class="label">适配物品</label>
      <select v-model="form.itemId" class="input">
        <option value="">（未关联物品，可手动填写）</option>
        <option v-for="i in items" :key="i.id" :value="i.id">
          {{ i.name }}{{ i.brandModel ? `（${i.brandModel}）` : '' }}
        </option>
      </select>
    </div>

    <div v-if="!form.itemId" class="field">
      <label class="label">手动填写适配物品</label>
      <input v-model="form.targetName" class="input" placeholder="例如：厨房净水器" />
    </div>

    <div class="row">
      <div class="field">
        <label class="label">更换周期 <em>*</em></label>
        <div class="cycle">
          <input v-model.number="form.cycleValue" type="number" min="1" class="input cycle-value" />
          <select v-model="form.cycleUnit" class="input">
            <option v-for="u in CYCLE_UNITS" :key="u.value" :value="u.value">每{{ u.label }}</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label class="label">上次更换日期 <em>*</em></label>
        <input v-model="form.lastReplacedDate" type="date" class="input" />
      </div>
    </div>

    <div class="field">
      <label class="label">备注</label>
      <textarea v-model="form.notes" class="input" rows="2" placeholder="例如：型号、购买渠道等"></textarea>
    </div>

    <div class="actions">
      <button type="button" class="btn" @click="emit('cancel')">取消</button>
      <button type="submit" class="btn btn-primary">保存</button>
    </div>
  </form>
</template>

<style scoped>
.consumable-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.cycle {
  display: flex;
  gap: 8px;
}
.cycle-value {
  width: 90px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
em {
  color: #e53e3e;
  font-style: normal;
}
@media (max-width: 480px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
