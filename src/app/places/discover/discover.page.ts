import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { configFromSession, SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  private placesSub: Subscription;
  private chosenFilter = 'all';
  constructor(private placesService: PlacesService, private authService: AuthService) { }

  ngOnInit() {
    this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      if (this.chosenFilter === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(
        place => place.userId !== this.authService.getUserId()
      );
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
  }
      console.log('LoadedPlaces', this.loadedPlaces);
    });
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'all') {
      this.relevantPlaces = this.loadedPlaces;
      this.chosenFilter = 'all';
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(place => place.userId !== this.authService.getUserId());
      this.chosenFilter = 'bookable';
    }
    this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    console.log(this.listedLoadedPlaces);
  }
  ngOnDestroy() {
    if (this.placesService) {
      this.placesSub.unsubscribe();
    }
  }
}
