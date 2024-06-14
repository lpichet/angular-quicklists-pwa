import { Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { Checklist } from '../interfaces/checklist';
import { ChecklistItem } from '../interfaces/checklist-item';
import { liveQuery } from 'dexie';
import { db } from './db';
import { EditChecklistItem } from '../interfaces/checklist-item';

export const LOCAL_STORAGE = new InjectionToken<Storage>(
  'window local storage object',
  {
    providedIn: 'root',
    factory: () => {
      return inject(PLATFORM_ID) === 'browser'
        ? window.localStorage
        : ({} as Storage);
    },
  }
);

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  storage = inject(LOCAL_STORAGE);

  loadChecklists(): Observable<Checklist[]> {
    // const checklists = this.storage.getItem('checklists');
    // return of(checklists ? (JSON.parse(checklists) as Checklist[]) : []);
    return from(liveQuery(() => db.checkLists.toArray()))
  }

  loadChecklistItems() {
    // const checklistsItems = this.storage.getItem('checklistItems');
    // return of(
    //   checklistsItems ? (JSON.parse(checklistsItems) as ChecklistItem[]) : []
    // );
    return from(liveQuery(() => db.checkListItems.toArray()))
  }

  saveChecklists(checklists: Checklist[]) {
    // this.storage.setItem('checklists', JSON.stringify(checklists));
    
  }

  async addChecklist(checklist: Checklist) {
    await db.checkLists.add(checklist);
  }

  async editChecklist(checklist: Checklist) {
    await db.checkLists.update(checklist.id, checklist);
  }

  async removeChecklist(checklistId: string) {
    await db.checkLists.delete(checklistId);
  }

  async addChecklistItem(checklistItem: ChecklistItem) {
    await db.checkListItems.add(checklistItem);
  }

  async editChecklistItem(checklistItem: EditChecklistItem) {
    await db.checkListItems.update(checklistItem.id, checklistItem.data);
  }

  async removeChecklistItem(checklistItemId: string) {
    await db.checkListItems.delete(checklistItemId);
  }

  async removeChecklistItems(checklistId: string) {
    await db.checkListItems.where('checklistId').equals(checklistId).delete();
  }

  async toggleChecklistItem(checklistItemId: string) {
    const item = await db.checkListItems.get(checklistItemId);
    if(!item) return;
    await db.checkListItems.update(checklistItemId, { checked: !item.checked });
  }

  async resetChecklistItems(checklistId: string) {
    await db.checkListItems.where('checklistId').equals(checklistId).modify({ checked: false });
  }

  saveChecklistItems(checklistItems: ChecklistItem[]) {
    // this.storage.setItem('checklistItems', JSON.stringify(checklistItems));
  }
}