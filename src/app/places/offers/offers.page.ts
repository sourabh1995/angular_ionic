import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  private placeSub: Subscription;
  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
    this.placeSub = this.placesService.places.subscribe(places => {
      this.offers = places;
    });
  }
  ionViewWillEnter() {
    this.placesService.fetchPlaces().subscribe();
  }
  onEdit(offerId: string, slidingOffer: IonItemSliding) {
    console.log(offerId);
    slidingOffer.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }
  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
