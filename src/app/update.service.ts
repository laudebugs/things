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
    // this.updateApplication({currentVersion: {hash: '123'}, latestVersion: {hash: '456'}} as VersionReadyEvent)
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

    const update$ = from(
      this.updates.checkForUpdate().catch(() => {
        console.log('Failed to check for update');
        return Promise.resolve(false);
      })
    ).pipe(
      tap((updateAvailable) => {
        console.log('Update available: ', updateAvailable);
      })
    );

    const versionUpdates$ = this.updates.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      tap((evt) => console.log('Version update event: ', evt)),
      catchError((error) => {
        console.error('Error occurred while updating: ', error.message);
        return EMPTY;
      })
    );

    const appUpdates$ = concat(appIsStable$, update$).pipe(
      mergeMap(() => versionUpdates$),
      retry()
    );

    every30SecondsOnceAppIsStable$
      .pipe(mergeMap(() => appUpdates$))
      .subscribe(() => this.updateApplication());
  }

  updateApplication(appUpdate?: VersionReadyEvent) {
    console.log(appUpdate);
    let snackBar: MatSnackBarRef<TextOnlySnackBar>;
    if (!appUpdate) {
      return
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
