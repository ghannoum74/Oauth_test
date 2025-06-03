// google-calendar.service.ts
import { Injectable } from '@angular/core';
import { loadGapiInsideDOM, gapi } from 'gapi-script';

@Injectable({ providedIn: 'root' })
export class GoogleCalendarService {
  async initClient(): Promise<void> {
    await loadGapiInsideDOM();
    return new Promise((resolve) => {
      gapi.load('client:auth2', async () => {
        await gapi.client.init({
          apiKey: 'AIzaSyDReUg_PyEd9p9w7aPEEJh_XNqrY0ReXzQ',
          clientId:
            '388983449781-86gun69hvf7lv4u1bg83h5237la7j0c5.apps.googleusercontent.com',
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ],
          scope: 'https://www.googleapis.com/auth/calendar',
        });
        resolve();
      });
    });
  }

  signIn(): Promise<any> {
    this.initClient();
    return gapi.auth2?.getAuthInstance().signIn();
  }

  signOut(): void {
    gapi.auth2.getAuthInstance().signOut();
  }

  listEvents(): Promise<any> {
    console.log(gapi.client);
    return gapi.client.calendar.events.list({
      calendarId: 'primary',
      // timeMin: new Date().toISOString(),
      // showDeleted: false,
      // singleEvents: true,
      // maxResults: 10,
      // orderBy: 'startTime'
    });
  }

  addEvent(event: any): Promise<any> {
    console.log('Adding event:', gapi);
    return gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
  }

  getCalendarList(): Promise<any> {
    return gapi.client.calendar.calendarList.list();
  }
  getCalendars(): Promise<any> {
    return gapi.client.calendar.calendars.get({ calendarId: 'primary' });
  }

  // Add update/delete as needed
}
