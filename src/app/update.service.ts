import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { EMPTY, catchError, filter, first, from, mergeMap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UpdateService {
  constructor(private appRef: ApplicationRef, private updates: SwUpdate) {
    this.checkForUpdates();
    console.log('initialized update service')
  }

  checkForUpdates() {
    const appIsStable$ = this.appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    appIsStable$
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
          return EMPTY;
        })
      )
      .subscribe((appUpdate) => {
        console.log(appUpdate);
      });
  }

  updateApplication(){

  }
}
