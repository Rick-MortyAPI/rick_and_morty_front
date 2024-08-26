import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesServiceService {

  private favoritesSubject = new BehaviorSubject<any[]>(this.loadFavorites());
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {}

  private loadFavorites(): any[] {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  }

  getFavorites(): any[] {
    return this.favoritesSubject.value;
  }

  addFavorite(character: any) {
    const currentFavorites = this.getFavorites();
    currentFavorites.push(character);
    this.updateFavorites(currentFavorites);
  }

  removeFavorite(character: any) {
    const currentFavorites = this.getFavorites().filter(fav => fav.id !== character.id);
    this.updateFavorites(currentFavorites);
  }

  isFavorite(character: any): boolean {
    return this.getFavorites().some(fav => fav.id === character.id);
  }

  private updateFavorites(favorites: any[]) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }
}
