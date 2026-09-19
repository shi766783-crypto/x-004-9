<script setup>
import { reactive } from 'vue'
import { CYCLE_UNITS } from '@/constants'
import { nextReplaceDate, todayStr } from '@/utils/date'

const props = defineProps({
  consumable: { type: Object, required: true }
})
const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  date: todayStr()
})

const unitLabel = CYCLE_UNITS.find((u) => u.value === props.consumable.cycleUnit)?.label || ''

function submit() {
  if (!form.date) {
    alert('请选择更换日期')
    return
  }
  emit('save', form.date)
}
</script>

<template>
  <form class="replace-form" @submit.prevent="submit">
    <p class="desc">
      记录「{{ consumable.name }}」的本次更换，系统会按
      每 {{ consumable.cycleValue }} {{ unitLabel }} 自动推算下次更换日期。
    </p>
    <div v-if="nextReplaceDate(consumable)" class="field">
      <label class="label">当前预计下次更换</label>
      <div class="due">{{ nextReplaceDate(consumable) }}</div>
    </div>
    <div class="field">
      <label class="label">本次更换日期 <em>*</em></label>
      <input v-model="form.date" type="date" class="input" />
    </div>
    <div class="actions">
      <button type="button" class="btn" @click="emit('cancel')">取消</button>
      <button type="submit" class="btn btn-primary">确认更换</button>
    </div>
  </form>
</template>

<style scoped>
.replace-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.desc {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}
.due {
  padding: 9px 12px;
  background: var(--bg-soft);
  border-radius: 8px;
  font-size: 14px;
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
</style>
