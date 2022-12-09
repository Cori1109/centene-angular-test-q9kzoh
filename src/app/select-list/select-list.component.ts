import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { Choice } from '../models';

@Component({
  selector: 'lib-select-list',
  templateUrl: './select-list.component.html',
  styleUrls: ['./select-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectListComponent),
      multi: true,
    },
  ],
})
export class SelectListComponent
  implements OnInit, ControlValueAccessor, OnDestroy
{
  @Input() fieldLabel: string;
  @Input() multiSelect = true;
  @Input() showName = false;
  @Input() idParent: string;
  @Input() isReadOnly = false;
  @Input() isDisable = false;
  @Input() disableAutoComplete = false;
  @Input() fieldCharLimit: number;
  @Input()
  set choices(value: Choice[]) {
    this.choicesList = value;
    this.initAutoComplete();
  }

  get choices(): Choice[] {
    return this.choicesList;
  }

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();
  @Output() searchValueChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('choiceInput') choiceInput: ElementRef<HTMLInputElement>;
  @ViewChild('choiceList') choiceList: MatChipList;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('acTrigger') acTrigger: MatAutocompleteTrigger;

  get selections(): Choice[] {
    return this.selectedChoices;
  }

  set selections(choices: Choice[]) {
    this.selectedChoices = choices;
    this.onChange(choices);
    this.onTouched();
  }

  choicesList: Choice[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  formControl = new FormControl(null, {
    validators: [this.selectValidator.bind(this)],
  });
  selectedChoices: Choice[] = [];
  filteredChoices$: Observable<Choice[]>;
  destroy$: Subject<boolean> = new Subject();

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  ngOnInit() {
    this.initAutoComplete();
  }

  getSelectionText() {
    return this.selections.map((entry) => entry.label).join(', ');
  }

  initAutoComplete() {
    this.filteredChoices$ = this.formControl.valueChanges.pipe(
      startWith(null),
      takeUntil(this.destroy$),
      map((value: Choice | string) =>
        !!value
          ? typeof value === 'string'
            ? this._filter(value)
            : this._filter(value.label)
          : this.choices
      )
    );
  }

  writeValue(preSelected: Choice[]): void {
    if (!!preSelected) {
      this.selections = preSelected;
    } else {
      this.selections = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  selectValidator(control: FormControl) {
    const value =
      (typeof control.value === 'string' && control.value.trim()) || '';
    const choices = !!value
      ? this._filter(value, this.disableAutoComplete)
      : [];
    const hasError = this.disableAutoComplete && !!value && !!choices.length;
    if (!!this.choiceList) {
      this.choiceList.errorState = hasError;
    }
    return hasError ? { unique: true } : null;
  }

  handleChoiceUpdate(event: Choice[]): void {
    this.selections = event;
    this.selectionChange.emit(event);
  }

  add(event: MatChipInputEvent): void {
    // Add choice only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = !!event.value
        ? this._filter(event.value, this.disableAutoComplete)
        : [];
      if (this.disableAutoComplete && !!event.value.trim() && !value.length) {
        value.push(new Choice(event.value.trim()));
      }
      if (
        value &&
        value.length &&
        !this.selectedChoices.find((v) => v.value === value[0].value)
      ) {
        this.selectedChoices.push(value[0]);
        this.handleChoiceUpdate(this.selectedChoices);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.formControl.setValue(null);
    }
  }

  remove(value: Choice): void {
    const index = this.selectedChoices.indexOf(value);

    if (index >= 0) {
      this.selectedChoices.splice(index, 1);
      this.handleChoiceUpdate(this.selectedChoices);
    }

    if (this.selectedChoices.length === 0) {
      this.searchValueChange.emit('');
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (
      !this.selectedChoices.find((v) => v.value === event.option.value.value)
    ) {
      this.selectedChoices.push(event.option.value);
    }
    this.choiceInput.nativeElement.value = '';
    this.choiceInput.nativeElement.blur();
    this.formControl.setValue(null);
    this.handleChoiceUpdate(this.selectedChoices);
  }

  private _filter(label = '', exact = false): Choice[] {
    return !!this.choices
      ? this.choices.filter((fieldVal) =>
          exact
            ? fieldVal.label.toLowerCase() === label.toLowerCase()
            : fieldVal.label.toLowerCase().includes(label.toLowerCase())
        )
      : [];
  }

  onKey(event: KeyboardEvent) {
    const key: string = (event.target as HTMLInputElement).value;
    const regex = /^[a-zA-Z0-9]+$/i;
    if (key === '' || regex.exec(key) !== null) {
      this.searchValueChange.emit(key);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const trimStr = event.clipboardData.getData('text/plain').trim();
    this.choiceInput.nativeElement.value = trimStr;
    this.formControl.setValue(trimStr);
    this.searchValueChange.emit(event.clipboardData.getData('text/plain'));
  }

  onFocus() {
    // Must force dropdown to open on first chip removal (in reassign), due to bug in matAutocomplete.
    if (this.selections.length < 1 || this.multiSelect) {
      this.acTrigger._onChange(this.formControl.value || '');
      this.acTrigger.openPanel();
    }
  }

  addOnBlur(event: FocusEvent) {
    const target: HTMLElement = event.relatedTarget as HTMLElement;
    if (
      this.formControl.valid &&
      (!target || target.tagName !== 'MAT-OPTION')
    ) {
      const matChipEvent: MatChipInputEvent = {
        input: this.choiceInput.nativeElement,
        value: this.choiceInput.nativeElement.value,
      } as MatChipInputEvent;
      this.acTrigger.closePanel();
      this.add(matChipEvent);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
