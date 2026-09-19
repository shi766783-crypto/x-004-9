<script setup>
import { reactive } from 'vue'
import { todayStr } from '@/utils/date'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  consumable: { type: Object, required: true }
})
const emit = defineEmits(['replace', 'cancel'])

const form = reactive({
  date: todayStr()
})

function submit() {
  if (!form.date) {
    alert('请选择更换日期')
    return
  }
  emit('replace', props.consumable.id, form.date)
}
</script>

<template>
  <BaseModal title="记录耗材更换" @close="emit('cancel')">
    <form class="replace-form" @submit.prevent="submit">
      <p class="tip">
        记录 <strong>{{ consumable.name }}</strong> 已更换后，提醒将自动按周期顺延到下次更换日。
      </p>
      <div class="field">
        <label class="label">更换日期 <em>*</em></label>
        <input v-model="form.date" type="date" class="input" />
      </div>
      <div class="actions">
        <button type="button" class="btn" @click="emit('cancel')">取消</button>
        <button type="submit" class="btn btn-primary">确认已更换</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.replace-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.tip {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
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
