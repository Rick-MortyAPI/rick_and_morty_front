import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CapturadoService } from './capturado.service';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class FoundServiceService {

  private foundCharacters: any[] = [];
  private foundSubject = new BehaviorSubject<any[]>([]);
  found$ = this.foundSubject.asObservable();

  constructor(
    private capturadosServ: CapturadoService,
  ) {
    this.loadFound().then(found => {
      this.foundCharacters = found;
      this.foundSubject.next(found);
    });
  }

  private async loadFound(): Promise<any[]> {
    try {
      // Obtener el JSON del usuario desde localStorage
      const userString = localStorage.getItem('user');
  
      // Validar si el JSON existe en localStorage
      if (!userString) {
        console.error("No se encontró el usuario en localStorage.");
        return [];
      }
  
      // Convertir la cadena JSON a un objeto
      const user = JSON.parse(userString);
  
      // Validar si el JSON contiene el ID del usuario
      if (!user.id) {
        console.error("El usuario en localStorage no tiene un ID válido.");
        return [];
      }
  
      // Llamar al servicio con el ID del usuario para obtener los capturados
      const capturados = await this.capturadosServ.getCapturadosByUser(user.id).toPromise();
      console.log("Personajes capturados: ", capturados);
      return capturados || [];
    } catch (error) {
      console.error("Error al cargar los capturados:", error);
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
