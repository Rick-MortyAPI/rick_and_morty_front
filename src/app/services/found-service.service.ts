import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoundServiceService {

  private foundCharacters: any[] = [];
  private foundSubject = new BehaviorSubject<any[]>(this.loadFound());
  found$ = this.foundSubject.asObservable();

  constructor() {}

  private loadFound(): any[] {
    try {
      return JSON.parse(localStorage.getItem('found') || '[]');
    } catch (error) {
      console.error("Error parsing JSON from localStorage:", error);
      return [];
    }
  }

  isCharacterFound(id: string): boolean {
    return this.getFound().some(character => character.id === id);
  }

  getFound(): any[] {
    return this.foundSubject.value;
  }

  addFound(character: any): void {
    this.foundCharacters.push(character);
    this.foundSubject.next(this.foundCharacters);
  }

  isFound(characterId: string): boolean {
    return this.foundCharacters.some(character => character.id === characterId);
  }

  removeFound(character: any) {
    const currentFound = this.getFound().filter(found => found.id !== character.id);
    this.updateFound(currentFound);
  }

  isFound(characterId: any): boolean {
    return this.getFound().some(found => found.id.toString() === characterId.toString());
  }  

  private updateFound(found: any[]) {
    localStorage.setItem('found', JSON.stringify(found));
    this.foundSubject.next(found);
  }
}
