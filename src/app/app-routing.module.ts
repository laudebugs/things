import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodComponent } from './food.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path:'food',
   component: FoodComponent
  },
  {
    path:'home',
   component: HomeComponent
  },
  {
    path:'**',
   component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
