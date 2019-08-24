import { Injectable } from '@angular/core';
import { Booking } from './bookings.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingPlace {
    id: string;
    placeId: string;
    userId: string;
    placeTitle: string;
    placeImage: string;
    guestNo: number;
    firstName: string;
    lastName: string;
    dateFrom: Date;
    dateTo: Date;
}
@Injectable({ providedIn: 'root'})

export class BookingService {
    generateId: string;
    // tslint:disable-next-line: variable-name
    private _bookings = new BehaviorSubject<Booking[]>([

    ]);
    constructor(private authService: AuthService, private http: HttpClient) {}
    get bookings() {
        return this._bookings.asObservable();
    }

    // tslint:disable-next-line: max-line-length
    addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string, lastName: string, guestNo: number, dateFrom: Date, dateTo: Date) {
        // tslint:disable-next-line: max-line-length
       const newBooking = new Booking(Math.random.toString(), placeId, this.authService.getUserId(), placeTitle, placeImage, guestNo, firstName, lastName, dateFrom, dateTo);
       return this.http.post<{name: string}>('https://ionic-angular-course-8a1ce.firebaseio.com/bookings.json', { ...newBooking, id: null})
       .pipe(switchMap(resData => {
           this.generateId = resData.name;
           return this.bookings;
       }), take(1), tap(bookings => {
           newBooking.id = this.generateId;
           this._bookings.next(bookings.concat(newBooking));
       }));
    }

    cancelBooking(bookingId: string) {
        return this.bookings.pipe(take(1), delay(1000), tap(bookings => {
            this._bookings.next(bookings.filter(b => b.id !== bookingId));
    })
    );
}
    fetchBookings() {
        // tslint:disable-next-line: max-line-length
       return  this.http.get<{[key: string]: BookingPlace}>(`https://ionic-angular-course-8a1ce.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.getUserId()}"`)
        .pipe( map(bookingData => {
            const bookings = [];
            for (const key in bookingData) {
                if (bookingData.hasOwnProperty(key)) {
                    // tslint:disable-next-line: max-line-length
                    bookings.push(new Booking(key, bookingData[key].placeId, bookingData[key].userId, bookingData[key].placeTitle, bookingData[key].placeImage, bookingData[key].guestNo, bookingData[key].firstName, bookingData[key].lastName, new Date(bookingData[key].dateFrom), new Date(bookingData[key].dateTo)));
                }
            }
            return bookings;
        }), tap(bookings => {
            this._bookings.next(bookings);
        }));
    }
}
