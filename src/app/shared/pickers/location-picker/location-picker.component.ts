import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation, Coordinate } from 'src/app/places/location.model';
import { of } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  // tslint:disable-next-line: max-line-length
  constructor(private alertCtrl: AlertController, private modalCtrl: ModalController, private http: HttpClient, private actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [
        {
          text: 'Auto-Locate', handler: () => {
            this.locateUser();
          }
        },
        {
          text: 'Pick on Map', handler: () => {
            this.openMap();
          }
        },
        {
          text: 'Cancel', role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }
  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      // tslint:disable-next-line: object-literal-shorthand
      lat: lat,
      // tslint:disable-next-line: object-literal-shorthand
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };
    this.getAddress(lat, lng).pipe(switchMap(address => {
      pickedLocation.address = address;
      return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
    })
    ).subscribe(staticMapUrl => {
      pickedLocation.staticMapImageUrl = staticMapUrl;
      this.selectedLocationImage = staticMapUrl;
      this.locationPick.emit(pickedLocation);
    });
  }
  private showErrorAlert() {
    this.alertCtrl.create({header: 'Could Not fetch Location', message: 'Please use Map to location the location', buttons: ['Okay']})
    .then(alertEl => alertEl.present());
  }
  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    Plugins.Geolocation.getCurrentPosition().then(geoPosition => {
      const coordinates: Coordinate = { lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude};
      this.createPlace(coordinates.lat, coordinates.lng);
    }).catch(err => {
      this.showErrorAlert();
    });
  }
  private openMap() {
    this.modalCtrl.create({
      component: MapModalComponent
    }).then(mapModalEl => {
      mapModalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinate = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };
        this.createPlace(coordinates.lat, coordinates.lng);
        console.log(modalData.data);
      });
      mapModalEl.present();
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapApiKey}`)
    .pipe(map((geoData: any) => {
      if (!geoData || !geoData.results || geoData.results.length === 0) {
        return null;
      }
      return geoData.results[0].formatted_address;
    }));
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7CPlace:S%7C${lat},${lng}&key=${environment.googleMapApiKey}`;
  }
}
