import { ApplicationRef, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import {
  EMPTY,
  catchError,
  concat,
  filter,
  first,
  from,
  interval,
  mergeMap,
  retry,
  tap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private matSnackBar: MatSnackBar
  ) {
    this.checkForUpdates();
  }

  checkForUpdates() {
    const appIsStable$ = this.appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    const every30Seconds$ = interval(5 * 1000);
    const every30SecondsOnceAppIsStable$ = concat(
      appIsStable$,
      every30Seconds$
    );

    const updateIsAvailable$ = from(
      this.updates.checkForUpdate().catch(() => Promise.resolve(false)     )
    )

    const appUpdate$ = this.updates.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      catchError(() => EMPTY),
    );

    updateIsAvailable$.pipe(mergeMap((isAvailable)=>{
      if(isAvailable){
        return appUpdate$
      }else{
        return EMPTY
      }
    })).subscribe((value) => {
      console.log(`updateIsAvailable$ ${JSON.stringify(value)}`);
      this.updateApplication(value)
    })
    // every30SecondsOnceAppIsStable$.pipe(mergeMap(() =>appUpdate$)).subscribe((value) => {
    //   console.log(`appUpdate$ ${value}`);
    // })
    // const appUpdates$ = appIsStable$.pipe(
    //   mergeMap(() => updateIsAvailable$.pipe(
    //     mergeMap(() => appUpdate$),
    //     tap((value) => {
    //       console.log(`1. Version ${value.currentVersion.hash} downloaded`);
    //       console.log(`1. Version ${value.latestVersion.hash} ready to install`);
    //     })
    //     )),
    //   tap((value) => {
    //     console.log(`2. Version ${value.currentVersion.hash} downloaded`);
    //     console.log(`2. Version ${value.latestVersion.hash} ready to install`);
    //   }),
    //   retry()
    // );

    // every30SecondsOnceAppIsStable$
    //   .pipe(mergeMap(() => appUpdates$))
    //   .subscribe((value) => this.updateApplication(value));
  }

  updateApplication(appUpdate?: VersionReadyEvent) {
    let snackBar: MatSnackBarRef<TextOnlySnackBar>;
    if (!appUpdate) {
      return;
    } else {
      snackBar = this.matSnackBar.open(
        `Updating from ${appUpdate.currentVersion.hash} to the latest version ${appUpdate.latestVersion.hash}`,
        'Dismiss',
        { duration: 30 * 1000 }
      );
    }
    snackBar.afterDismissed().subscribe(() => {
      window.location.reload();
    });
  }
}
