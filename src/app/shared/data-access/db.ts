import Dexie, { Table } from 'dexie';
import { Checklist } from '../interfaces/checklist';
import { ChecklistItem } from '../interfaces/checklist-item';

export class AppDB extends Dexie {
    checkLists!: Table<Checklist, string>;
    checkListItems!: Table<ChecklistItem, string>;
  
    constructor() {
      super('quicklists', { autoOpen: true});
      console.log('AppDB constructor');
      this.version(3).stores({
        checkLists: '&id',
        checkListItems: '&id, checklistId',
      });
      this.on('populate', () => this.populate());
    }
  
    async populate() {
      const checklistId = await db.checkLists.add({
        id: 'to-do-today',
        title: 'To Do Today',
      });
      await db.checkListItems.bulkAdd([
        {
            id: '2104512',
            checklistId,
            title: 'Feed the birds',
            checked: false,
        },
        {
            id: '4841562',
            checked: false,
            checklistId,
            title: 'Watch a movie',
        },
        {
            id: '4984512',
            checked: false,
            checklistId,
            title: 'Have some sleep',
        },
      ]);
    }
  }
  
  export const db = new AppDB();