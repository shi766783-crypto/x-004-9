import { defineStore } from 'pinia'
import { consumableRepo } from '@/services/db'
import { uid } from '@/utils/id'
import { todayStr } from '@/utils/date'

export const useConsumableStore = defineStore('consumables', {
  state: () => ({
    consumables: consumableRepo.get()
  }),
  getters: {
    consumableById: (state) => (id) => state.consumables.find((c) => c.id === id),
    consumablesByItem: (state) => (itemId) =>
      state.consumables.filter((c) => c.itemId === itemId)
  },
  actions: {
    addConsumable(payload) {
      const consumable = {
        id: uid('con_'),
        createdAt: todayStr(),
        itemId: '',
        targetName: '',
        notes: '',
        ...payload
      }
      this.consumables.unshift(consumable)
      consumableRepo.set(this.consumables)
      return consumable
    },
    updateConsumable(id, payload) {
      const idx = this.consumables.findIndex((c) => c.id === id)
      if (idx === -1) return
      this.consumables[idx] = { ...this.consumables[idx], ...payload, id }
      consumableRepo.set(this.consumables)
    },
    removeConsumable(id) {
      this.consumables = this.consumables.filter((c) => c.id !== id)
      consumableRepo.set(this.consumables)
    },
    // 记录一次更换：刷新"上次更换日期"，到期提醒随之顺延一个周期
    markReplaced(id, date = todayStr()) {
      const c = this.consumables.find((x) => x.id === id)
      if (!c) return
      if (!c.lastReplacedDate || date >= c.lastReplacedDate) {
        c.lastReplacedDate = date
      }
      consumableRepo.set(this.consumables)
    }
  }
})
