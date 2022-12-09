import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectListComponent } from './select-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [
    SelectListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [
    SelectListComponent
  ]
})
export class SelectListModule { }
