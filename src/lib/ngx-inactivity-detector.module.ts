import { NgModule } from "@angular/core";
import { NgxInactivityDetectorDirective } from './ngx-inactivity-detector.directive';

@NgModule({
  declarations:[
    NgxInactivityDetectorDirective
  ],
  exports:[NgxInactivityDetectorDirective]
})

export class NgxInactivityDetectorModule {

}
