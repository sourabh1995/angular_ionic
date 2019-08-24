import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElementRef: ElementRef;
  @Input() center: { lat: -34.397, lng: 150.644 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  clickListener: any;
  googleMaps: any;
  constructor(private modalCtrl: ModalController, private render: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps().then(googleMaps => {
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      // tslint:disable-next-line: no-unused-expression
      // tslint:disable-next-line: no-shadowed-variable
      const map = new googleMaps.Map(mapEl, {
        center: this.center,
        zoom: 16
      });
      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.render.addClass(mapEl, 'visible');
      });
      if (this.selectable) {
        this.clickListener = map.addListener('click', event => {
          const selectedCoords = {lat: event.latLng.lat(), lng: event.latLng.lng()};
          this.modalCtrl.dismiss(selectedCoords);
        });
      } else {
        const marker = new googleMaps.Marker({
          position: this.center,
          // tslint:disable-next-line: object-literal-shorthand
          map: map,
          title: 'Pick Location'
        });
        marker.setMap(map);
      }
    }).catch(err => {
      console.log('Map not available');
    });
  }
  onCancel() {
    this.modalCtrl.dismiss();
  }
  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.removeListener(this.clickListener);
    }
  }
  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    // tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapApiKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google map SDK not available');
        }
      };
    });
  }
}
