import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodComponent } from './places/food.component';
import { HomeComponent } from './places/home.component';
import { BeachComponent } from './places/beach.component';
import { MountainComponent } from './places/mountain.component';
import { CityComponent } from './places/city.component';
import { OfficeComponent } from './places/office.component';
import { MarsComponent } from './places/mars.component';
import { HospitalComponent } from './places/hospital.component';

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
  {
    path: 'office',
    component: OfficeComponent,
  },
  {
    path: 'mars',
    component: MarsComponent,
  },
  {
    path: 'hospital',
    component: HospitalComponent
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
