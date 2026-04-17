import { create } from 'zustand'
import type { AppSection } from '../types'

interface ModalState {
  type: 'place' | 'accommodation' | 'reservation' | 'packing' | 'note' | 'list' | 'confirm' | null
  itemId?: string | null
  extra?: Record<string, unknown>
}

interface UIState {
  activeSection: AppSection
  modal: ModalState
  activeListId: string | null
  reservationFilter: 'all' | 'dining' | 'transport' | 'activity'
  sidebarPlacesExpanded: boolean
  toastMessage: string | null
  sidebarOpen: boolean

  setSection: (section: AppSection) => void
  openModal: (type: ModalState['type'], itemId?: string | null, extra?: Record<string, unknown>) => void
  closeModal: () => void
  setActiveListId: (id: string | null) => void
  setReservationFilter: (filter: UIState['reservationFilter']) => void
  toggleSidebarPlaces: () => void
  showToast: (message: string) => void
  clearToast: () => void
  toggleSidebar: () => void
  closeSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeSection: 'overview',
  modal: { type: null, itemId: null },
  activeListId: null,
  reservationFilter: 'all',
  sidebarPlacesExpanded: true,
  toastMessage: null,
  sidebarOpen: false,

  setSection: (section) => set({ activeSection: section }),
  openModal: (type, itemId = null, extra) => set({ modal: { type, itemId, extra } }),
  closeModal: () => set({ modal: { type: null, itemId: null } }),
  setActiveListId: (id) => set({ activeListId: id }),
  setReservationFilter: (filter) => set({ reservationFilter: filter }),
  toggleSidebarPlaces: () => set((s) => ({ sidebarPlacesExpanded: !s.sidebarPlacesExpanded })),
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}))
