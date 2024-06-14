import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
} from '../../shared/interfaces/checklist-item';
import { RemoveChecklist } from '../../shared/interfaces/checklist';
import { StorageService } from '../../shared/data-access/storage.service';

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  storageService = inject(StorageService);
  // state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
  });

  // selectors
  checklistItems = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded);

  // sources
  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  remove$ = new Subject<RemoveChecklistItem>();
  edit$ = new Subject<EditChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklist>();

  constructor() {
    //reducers
    this.checklistItemsLoaded$
      .pipe(takeUntilDestroyed())
      .subscribe((checklistItems) =>
        this.state.update((state) => ({
          ...state,
          checklistItems,
          loaded: true,
        }))
      );
    this.add$.pipe(takeUntilDestroyed()).subscribe(async (addChecklistItem: AddChecklistItem) => {
      const checklistItem: ChecklistItem = {
        ...addChecklistItem.item,
        id: Date.now().toString(),
        checklistId: addChecklistItem.checklistId,
        checked: false,
      };
      await this.storageService.addChecklistItem(checklistItem);
      return this.state.update((state) => ({
        ...state,
        checklistItems: [
          ...state.checklistItems,
          checklistItem
        ],
      }))
    }
    );
    this.toggle$.pipe(takeUntilDestroyed()).subscribe(async (checklistItemId) => {
      await this.storageService.toggleChecklistItem(checklistItemId);
      return this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        ),
      }))
    });
    this.reset$.pipe(takeUntilDestroyed()).subscribe(async (checklistId) => {
      await this.storageService.resetChecklistItems(checklistId);
      return this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId ? { ...item, checked: false } : item
        ),
      }))
    });
    this.edit$.pipe(takeUntilDestroyed()).subscribe(async (update: EditChecklistItem) => {
      await this.storageService.editChecklistItem(update);
      return this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === update.id ? { ...item, title: update.data.title } : item
        ),
      }))
    });
    this.remove$.pipe(takeUntilDestroyed()).subscribe(async (id) => {
      await this.storageService.removeChecklistItem(id);
      return this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter((item) => item.id !== id),
      }))
    });
    this.checklistRemoved$.pipe(takeUntilDestroyed()).subscribe(async (checklistId) => {
      await this.storageService.removeChecklistItems(checklistId);      
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter(
          (item) => item.checklistId !== checklistId
        ),
      }))
    });
    // effects
    // effect(() => {
    //   if (this.loaded()) {
    //     this.storageService.saveChecklistItems(this.checklistItems());
    //   }
    // });
  }
}