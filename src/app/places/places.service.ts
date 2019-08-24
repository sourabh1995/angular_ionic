import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([]);
  get places() {
    console.log(this._places);
    return this._places.asObservable();
  }
  private generatedId: string;
  constructor(private authService: AuthService, private http: HttpClient) { }

  getPlace(id: string) {
    return this.http.get<Place>(
      `https://ionic-angular-course-8a1ce.firebaseio.com/offered-places/${id}.json`)
      .pipe(
        map(placeData => {
          // tslint:disable-next-line: max-line-length
          return new Place(id, placeData.title, placeData.description, placeData.imageUrl, placeData.price, new Date(placeData.availableFrom), new Date(placeData.availableTo), placeData.userId, placeData.location);
        })
      );
  }

  addPlace(title: string, description: string, prices: number, dateFrom: Date, dateTo: Date, location: PlaceLocation) {
    // tslint:disable-next-line: max-line-length
    const newPlace = new Place(Math.random().toString(), title, description, 'https://toim.b-cdn.net/pictures/travel_guide/bangalore-684.jpeg', prices, dateFrom, dateTo, this.authService.getUserId(), location);
    return this.http.post<{name: string}>('https://ionic-angular-course-8a1ce.firebaseio.com/offered-places.json', {...newPlace, id: null})
    .pipe(
      switchMap(resData => {
        this.generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = this.generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updateOffer(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(take(1), switchMap(places => {
      if (!places || places.length <= 0) {
        return this.fetchPlaces();
      } else {
        return of(places);
      }
    }),
    switchMap(places => {
      const updatedPlacesIndex = places.findIndex(pl => pl.id === placeId);
      updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlacesIndex];
      // tslint:disable-next-line: max-line-length
      updatedPlaces[updatedPlacesIndex] = new Place(oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price, oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId, oldPlace.location);
      return this.http.put(`https://ionic-angular-course-8a1ce.firebaseio.com/offered-places/${placeId}.json`,
      {...updatedPlaces[updatedPlacesIndex], id: null});
    }),
    tap(() => {
      this._places.next(updatedPlaces);
    }));
  }

  fetchPlaces() {
    return this.http.get<{[key: string]: Place}>('https://ionic-angular-course-8a1ce.firebaseio.com/offered-places.json')
    .pipe(map(resData => {
      const places = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          // tslint:disable-next-line: max-line-length
          places.push(new Place(key, resData[key].title, resData[key].description, resData[key].imageUrl, resData[key].price, new Date(resData[key].availableFrom), new Date(resData[key].availableTo), this.authService.getUserId(), resData[key].location));
        }
      }
      return places;
    }),
    tap(places => {
      this._places.next(places);
    })
    );
  }
}
