import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gapi, loadGapiInsideDOM } from 'gapi-script';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { GoogleCalendarService } from './app.service';
import {
  CalendarMonthViewBeforeRenderEvent,
  CalendarMonthViewComponent,
} from 'angular-calendar';
import {
  CalendarEvent,
  CalendarModule,
  CalendarView,
  DateAdapter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {
  addDays,
  addHours,
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';
import { ResizableModule } from 'angular-resizable-element';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { Subject } from 'rxjs';
import { WeekDay } from 'calendar-utils';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    DragAndDropModule,
    ResizableModule,
    FullCalendarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  token: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gcal: GoogleCalendarService
  ) {}

  ngOnInit(): void {
    // Check if token is in query params
    this.route.queryParams.subscribe((params) => {
      const urlToken = params['token'];
      console.log('URL Token:', urlToken);
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        this.token = urlToken;

        // Remove token from URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true,
        });
      } else {
        // If no token in URL, check localStorage
        this.token = localStorage.getItem('token');
      }
    });
  }

  loginWithGoogle(): void {
    // Redirect to your backend OAuth endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  }

  calendarOptions: CalendarOptions = {
    // Basic Setup
    plugins: [interactionPlugin, timeGridPlugin],
    initialView: 'timeGridDay',
    initialDate: new Date(),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,dayGridMonth,listWeek',
    },

    // Views Configuration
    views: {
      timeGridDay: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
        slotMinTime: '00:00:00',
        slotMaxTime: '23:59:00',
      },
      timeGridWeek: {
        slotcolor: '#000000',
        slotMinTime: '00:00:00',
        slotMaxTime: '23:59:00',
      },
    },

    // Time Display
    allDaySlot: false,
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'short',
    },
    nowIndicator: true,
    scrollTime: '08:00:00',

    // Business Hours
    // businessHours: {
    //   daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    //   startTime: '09:00',
    //   endTime: '17:00',
    // },

    // Events
    events: this.getEvents(),
    eventColor: '#378006',
    eventTextColor: '#ffffff',
    eventDisplay: 'block',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: 'short',
    },
    eventOverlap: true,

    // Drag & Drop
    editable: true,
    eventClassNames: ['event'],
    selectable: true,
    selectMirror: true,
    droppable: false,

    // Event Handlers
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    select: this.handleDateSelect.bind(this),

    // Height & Aspect
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.8,

    // Localization
    locale: 'en',
    firstDay: 0, // Monday
    weekNumberCalculation: 'ISO',

    // Miscellaneous
    navLinks: true,
    now: new Date(),
    progressiveEventRendering: true,
    handleWindowResize: true,
    weekends: true,
    dayMaxEvents: true,
    stickyHeaderDates: true,
    dayHeaderFormat: { weekday: 'short', day: 'numeric' },
  };

  getEvents(): EventInput[] {
    return [
      {
        id: '1',
        title: 'Team Meeting',
        start: this.getDateWithTime(9, 30),
        end: this.getDateWithTime(11, 0),
        color: '#257e4a',
        extendedProps: {
          description: 'Weekly team sync',
          location: 'Conference Room A',
        },
      },
      {
        id: '2',
        title: 'Lunch Break',
        start: this.getDateWithTime(12, 0),
        end: this.getDateWithTime(13, 0),
        color: '#ff9f89',
        extendedProps: {
          description: 'Lunch with team',
          location: 'Cafeteria',
        },
      },
      {
        id: '3',
        title: 'Client Call',
        start: this.getDateWithTime(14, 0),
        end: this.getDateWithTime(15, 30),
        color: '#3788d8',
        extendedProps: {
          description: 'Project discussion',
          location: 'Online',
        },
      },
    ];
  }
  private getDateWithTime(hours: number, minutes: number): Date {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Event Handlers
  handleDateClick(arg: any) {
    console.log('Date clicked:', arg.dateStr);
    alert('Date clicked: ' + arg.dateStr);
  }

  handleEventClick(clickInfo: EventClickArg) {
    console.log('Event clicked:', clickInfo.event.title);
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'?`
      )
    ) {
      clickInfo.event.remove();
    }
  }

  handleEventDrop(dropInfo: EventDropArg) {
    console.log('Event dropped:', dropInfo.event.title, dropInfo.event.start);
    alert(
      `${
        dropInfo.event.title
      } was moved to ${dropInfo.event.start?.toLocaleString()}`
    );
  }

  handleEventResize(resizeInfo: any) {
    console.log(
      'Event resized:',
      resizeInfo.event.title,
      resizeInfo.event.start,
      resizeInfo.event.end
    );
    alert(
      `${
        resizeInfo.event.title
      } was resized to ${resizeInfo.event.start?.toLocaleString()} - ${resizeInfo.event.end?.toLocaleString()}`
    );
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: String(Math.random()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        color: '#ffcc00',
      });
    }
  }

  async loginAndFetchEvents() {
    await this.gcal.signIn();
    const res = await this.gcal.listEvents();
    // this.events = res.result.items;
  }

  createTestEvent() {
    const event = {
      summary: 'Test Event',
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() }, // +1 hour
    };
    this.gcal.addEvent(event).then(() => {
      alert('Event added!');
      this.loginAndFetchEvents();
    });
  }

  listEvents() {
    this.gcal.listEvents().then((res) => {
      // this.events = res.result.items;
      console.log('Events:', res);
    });
  }

  getCalendarList() {
    this.gcal.getCalendarList().then((res) => {
      console.log('Calendar List:', res);
    });
  }
  getCalendar() {
    this.gcal.getCalendars().then((res) => {
      console.log('Calendar:', res);
    });
  }

  eventTimesChanged(e: any): void {
    e.event.start = e.newStart;
    e.event.end = e.newEnd;
    // this.events = [...this.events];
  }
}
