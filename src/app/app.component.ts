import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Choice } from './models';

/**
 * This application is a basic example of an autocomplete control. Right now, it uses a static list of
 * @type {Choice} objects that the user can select from. Your assignment is to update this component so
 * that it instead gets the list of cocktails from a REST API and does its filtering server-side. Use
 * the @function onValueChange() to capture the value as the user is typing in the field. The resulting
 * @type {Choice} object should use @property {string} idDrink of the @type {Drink} as the value and
 * @property {string} strDrink as the label.
 *
 * See ./models.ts for more information
 *
 * API: https://www.thecocktaildb.com/api/json/v1/1/search.php?s=<search term>
 * Response: @typedef DrinkResponse
 */
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  form: FormGroup;
  choices: Choice[];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.choices = [
      new Choice('1', 'Gin & Tonic'),
      new Choice('2', 'Rum & Coke'),
      new Choice('3', 'Martini'),
    ];
  }

  ngOnInit() {
    this.form = this.fb.group({
      drink: [[]],
    });

    // Initialize autocomplete
    this.onValueChange('');
  }

  onValueChange(text: string) {
    // Enter solution here
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${text}`).then(r => r.json()).then(r => this.choices = r.drinks.map((cur, i)=>(new Choice(i, cur.strDrink))
    ));
  }
}
