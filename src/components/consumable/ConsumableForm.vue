<script setup>
import { reactive } from 'vue'
import { CYCLE_UNITS } from '@/constants'

const props = defineProps({
  consumable: { type: Object, default: null },
  // 可选的适配物品列表（物品档案）
  items: { type: Array, default: () => [] },
  // 从物品详情页发起登记时预设适配物品
  presetItemId: { type: String, default: '' }
})
const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  name: props.consumable?.name || '',
  itemId: props.consumable?.itemId || props.presetItemId || '',
  cycleValue: props.consumable?.cycleValue ?? 6,
  cycleUnit: props.consumable?.cycleUnit || 'month',
  lastReplacedDate: props.consumable?.lastReplacedDate || '',
  notes: props.consumable?.notes || ''
})

function submit() {
  if (!form.name.trim()) {
    alert('请填写耗材名称')
    return
  }
  emit('save', { ...form, cycleValue: Number(form.cycleValue) || 1 })
}
</script>

<template>
  <form class="consumable-form" @submit.prevent="submit">
    <div class="field">
      <label class="label">耗材名称 <em>*</em></label>
      <input v-model="form.name" class="input" placeholder="例如：净水器滤芯、空调遥控器电池" />
    </div>

    <div class="field">
      <label class="label">适配物品</label>
      <select v-model="form.itemId" class="input">
        <option value="">未关联物品</option>
        <option v-for="i in items" :key="i.id" :value="i.id">{{ i.name }}</option>
      </select>
    </div>

    <div class="row">
      <div class="field">
        <label class="label">更换周期</label>
        <div class="cycle">
          <input v-model.number="form.cycleValue" type="number" min="1" class="input cycle-value" />
          <select v-model="form.cycleUnit" class="input">
            <option v-for="u in CYCLE_UNITS" :key="u.value" :value="u.value">每{{ u.label }}</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label class="label">上次更换日期</label>
        <input v-model="form.lastReplacedDate" type="date" class="input" />
      </div>
    </div>

    <div class="field">
      <label class="label">备注</label>
      <textarea v-model="form.notes" class="input" rows="2" placeholder="例如：型号、购买渠道、规格"></textarea>
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
