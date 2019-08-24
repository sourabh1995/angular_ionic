import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from '../../../bookings/bookings.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;
  // tslint:disable-next-line: max-line-length
  constructor(private authService: AuthService, private router: ActivatedRoute, private navCtrl: NavController, private placesService: PlacesService, private modalCtrl: ModalController, private actionSheetCtrl: ActionSheetController, private bookingService: BookingService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.router.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== this.authService.getUserId();
        this.isLoading = false;
      });
    });
  }
  onBookPlace() {
    // this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModel('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModel('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    })
    .then(actionSheetEl => {
      actionSheetEl.present();
    });
  }
  openBookingModel(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    })
    .then(modelEl => {
      modelEl.present();
      return modelEl.onDidDismiss();
    })
    .then(resultData => {
      console.log(resultData.data, resultData.role);
      if (resultData.role === 'confirm') {
        this.loadingCtrl.create({
          message: 'Booking Place...'
        }).then(loadingEl => {
          console.log('Booked!');
          loadingEl.present();
          const data = resultData.data.bookingDate;
        // tslint:disable-next-line: max-line-length
          this.bookingService.addBooking(this.place.id, this.place.title, this.place.imageUrl, data.firstName, data.lastName, data.guestNo, data.startDate, data.endDate)
          .subscribe(() => { loadingEl.dismiss();
          }
          );
       });
        }
    });
  }

  onShowFullMap() {
    this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        center: { lat: this.place.location.lat, lng: this.place.location.lng },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    }).then(modalEl => {
      modalEl.present();
    });
  }
  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
