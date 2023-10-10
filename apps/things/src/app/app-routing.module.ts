import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodComponent } from './food.component';
import { HomeComponent } from './home.component';
import { BeachComponent } from './beach.component';
import { MountainComponent } from './mountain.component';
import { CityComponent } from './city.component';
import { OfficeComponent } from './office.component';
import { MarsComponent } from './mars.component';

const routes: Routes = [
  {
    path: 'food',
    component: FoodComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'beach',
    component: BeachComponent,
  },
  // mountain
  {
    path: 'mountain',
    component: MountainComponent,
  },
  {
    path: 'city',
    component: CityComponent,
  },
  // office
  {
    path: 'office',
    component: OfficeComponent,
  },
  {
    path: 'mars',
    component: MarsComponent,
  },
  {
    path: '**',
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
