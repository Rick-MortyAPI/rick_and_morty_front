import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { LocationsServiceService } from '../../services/locations-service.service';

@Component({
  selector: 'app-lugares',
  templateUrl: './lugares.component.html',
  styleUrls: ['./lugares.component.scss'],
})
export class LugaresComponent  implements OnInit {

  locations: any[] = [];
  currentPage: number = 1;
  isLoading: boolean = false;

  constructor( private locationsServiceService: LocationsServiceService ) { }

  ngOnInit() {
    this.loadLocations();
  }

  getRandomImage(): string {
    const randomIndex = Math.floor(Math.random() * 17) + 1;
    return `../../../assets/Images//image${randomIndex}.png`;
  }

  loadLocations(event?: InfiniteScrollCustomEvent) {
    if (this.isLoading) return;
    this.isLoading = true;

    this.locationsServiceService.getLocationsByPage(this.currentPage).subscribe(
      (data) => {
        this.locations = [...this.locations, ...data];
        this.currentPage++;
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      },
      (error) => {
        console.error('Error fetching characters:', error);
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    );
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.loadLocations(event);
  }

}
