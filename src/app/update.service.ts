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
  filter,
  first,
  from,
  mergeMap,
  retry,
  shareReplay
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
    )

    const updateIsAvailable$ = from(
      this.updates.checkForUpdate().catch(() => Promise.resolve(false))
    );

    const appUpdate$ = this.updates.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      catchError(() => EMPTY),
      shareReplay(1)
    );

    appIsStable$
      .pipe(
        mergeMap(() => updateIsAvailable$),
        mergeMap((isAvailable) => isAvailable ? appUpdate$ : EMPTY),
        retry(1)
      )
      .subscribe((value) =>
        this.updateApplication(value)
      )
  }

  updateApplication(appUpdate: VersionReadyEvent) {
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
    snackBar.onAction().subscribe(() => {
      window.location.reload();
    });
  }
}
