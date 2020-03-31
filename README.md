# ngx-inactivity-detector
Angular (6.x+) directive to handle user inactivity


## Installation
Using NPM:
```
npm install ngx-inactivity-detector --save
```


## Requirements
 - [Angular](https://github.com/angular/angular) (6.x+)
 - [RxJS](https://github.com/Reactive-Extensions/RxJS)  (6.x+)

## Usage
In your app.module file:
```ts
import { NgxInactivityDetectorModule } from 'ngx-inactivity-detector';

@NgModule({
  ...
  imports: [
    NgxInactivityDetectorModule
  ]
  ...
})
```


In your app.component.html file:
```html
<div  [ngxInactivityDetector]="10" (inactivityTimeout)="timeout()" (timerReset)="reset($event)">
```

In your app.component.ts file
```ts
export class AppComponent {

  /**
   * Handle inactivity callback
   */
  public timeout() {
    // handle user inactivity
  }

  /**
   * interface ITimerReset {
      resetEvent: Event; // DOM event which resetted the timer
      interval: number; // interval at which the timer is resetted
    }
   */
  public reset(event: ITimerReset) {

  }
}
```


## Options
- **[ngxInactivityDetector]** - inactivity timeout in minutes (10 minutes by defualt)
- **[debounceTime]** - delay between each reset event in milliseconds (1000 by default)
- **[resetEvents]** - list of events which triggers reset timeout (['mousedown','mousemove','touchend','touchmove','wheel','keypress'] by default)
 
- **(inactivityTimeout)** - event emitter to handle inactivity callback
- **(timerReset)** - event emitter whenever the inactivity timer resets


## Examples
- Add callback "timeout" after 15 minutes of user's inactivity:
```html
<div
  [ngxInactivityDetector]="15"
  (inactivityTimeout)="timeout()">
  ...
</div>
