import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { EMPTY, catchError, concat, filter, first, from, interval, mergeMap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UpdateService {
  constructor(private appRef: ApplicationRef, private updates: SwUpdate) {
    this.checkForUpdates();
  }

  checkForUpdates() {
    const appIsStable$ = this.appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    const every30Seconds$ = interval(6 * 60 * 60 * 1000);
    const every30SecondsOnceAppIsStable$ = concat(appIsStable$, every30Seconds$);

    const appUpdates$ = appIsStable$
      .pipe(
        mergeMap(() => from(this.updates.checkForUpdate())),
        catchError((err) => {
          console.log(
            `%cThere was an error checking for updates: ${err}`,
            'background: #e91e63; color: #fff'
          );
          return EMPTY;
        }),
        mergeMap((updateAvailable) => {
          if (updateAvailable) {
            return this.updates.versionUpdates.pipe(
              filter(
                (evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'
              )
            );
          }
          else {
            console.log(`No updates available. Checked at ${new Date().toUTCString()}`);
            return EMPTY;
          }
        })
      )
      every30SecondsOnceAppIsStable$.pipe(
        mergeMap(() => appUpdates$)
      ).subscribe((appUpdate) => {
        console.log(appUpdate);
      })
  }

  updateApplication(){

  }
}