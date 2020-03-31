import { Directive, Output, EventEmitter, Input, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { fromEvent, Observable, merge, Subscription} from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface ITimerReset {
  resetEvent: Event;
  interval: number;
}

@Directive({
  selector: '[ngxInactivityDetector]'
})

export class NgxInactivityDetectorDirective implements AfterViewInit, OnDestroy {

  /**
   * inactivity timeout in minutes
   */
  @Input() ngxInactivityDetector = 10;

  /**
   * delay time in milliseconds between each event
   */
  @Input() debounceTime = 1000;

  /**
   * events which triggers reset
   */
  @Input() resetEvents = [
    'mousedown',
    'mousemove',
    'touchend',
    'touchmove',
    'wheel',
    'keypress'
  ];

  /**
   * emits after given interval
   */
  @Output() inactivityTimeout = new EventEmitter();

  /**
   * emits DOM event and the interval for each reset event
   */
  @Output() timerReset = new EventEmitter<ITimerReset>();

  /**
   * convert minutes to milliseconds
   */
  get interval() {
    return (this.ngxInactivityDetector * 60 * 1000);
  }

  /**
   * timeout id
   */
  private inactivityIntervalRef;

  private eventSubscriptions: Subscription;

  private eventsListeners = [];

  /**
   * mousedown event
   */
  private mouseDown: Observable<any>;

  /**
   * mousemove event
   */
  private mouseMove: Observable<any>;

  /**
   * wheelmove event
   */
  private wheelMove: Observable<any>;

  /**
   * touchend event
   */
  private touchEnd: Observable<any>;

  /**
   * keypress event
   */
  private keyPress: Observable<any>;

  /**
   * touchmove event
   */
  private touchMove: Observable<any>;

  /**
   * start time of inactivity
   */
  private startTime: number;


  constructor(private _zone: NgZone) {}

  ngAfterViewInit() {
    this.setupTimer();
  }

  setupTimer() {
    this.setupInactivityListeners();
    this._zone.runOutsideAngular( () => {
      this.subscribeEvents();
    });

    this.initTimer();
  }

  /**
   * creates an array of observable of each event
   */
  private setupInactivityListeners() {
    for (const event of this.resetEvents) {
      this.eventsListeners.push(fromEvent(document, event));
    }
  }

  /**
   * Subscribes to each events observable
   */
  private subscribeEvents() {
    const allEvents = merge(...this.eventsListeners);
    this.eventSubscriptions = allEvents.pipe(debounceTime(this.debounceTime))
    .subscribe( (event: Event) => {
      const timeDifference = (Date.now() - this.startTime) / (1000 * 60);
      this.timerReset.emit({
        resetEvent: event,
        interval: timeDifference
      })
      this.resetInactivityTimer();
    });
  }

  /**
   * resets the inactivity timer
   */
  private resetInactivityTimer() {
    this.startTime = Date.now();
    window.clearTimeout(this.inactivityIntervalRef);
    this.setInactivityInterval();
  }

  /**
   * implements the timeout method
   */
  private setInactivityInterval() {
    this.inactivityIntervalRef = window.setTimeout( () => {
      this.inactivityTimeout.emit();
      this.resetInactivityTimer();
    }, this.interval);
  }

  /**
   * initializes the timer
   */
  private initTimer() {
    this.startTime = Date.now();
    this.setInactivityInterval();
  }

  /**
   * remove event listeners of all events
   */
  private removeAllListerners() {
    if (this.eventSubscriptions) {
      this.eventSubscriptions.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.removeAllListerners();
  }

}
