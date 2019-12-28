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
   * creates observable of each event
   */
  private setupInactivityListeners() {
    this.mouseDown = fromEvent(document, 'mousedown');
    this.mouseMove = fromEvent(document, 'mousemove');
    this.touchEnd = fromEvent(document, 'touchend');
    this.touchMove = fromEvent(document, 'touchmove');
    this.wheelMove = fromEvent(document, 'wheel');
    this.keyPress = fromEvent(document, 'keypress');
  }

  /**
   * Subscribes to each events observable
   */
  private subscribeEvents() {
    const allEvents = merge(this.mouseDown, this.mouseMove, this.touchEnd, this.touchMove, this.wheelMove, this.keyPress);
    this.eventSubscriptions = allEvents.pipe(debounceTime(1000))
    .subscribe( (event) => {
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
