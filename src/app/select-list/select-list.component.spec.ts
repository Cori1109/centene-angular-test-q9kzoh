import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { SelectListComponent } from './select-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, ElementRef} from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteModule, MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { Choice } from '../../models/choice';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { PipesModule } from '../../pipes/pipes.module';
import createSpyObj = jasmine.createSpyObj;
import {_MatOptionBase} from '@angular/material/core';
import createSpy = jasmine.createSpy;
import {skip} from 'rxjs/operators';

describe('SelectListComponent', () => {
  let component: SelectListComponent;
  let fixture: ComponentFixture<SelectListComponent>;

  const clipboardEventSpy = createSpyObj<ClipboardEvent>('ClipboardEvent', ['preventDefault'], ['clipboardData']);
  const dataTransferSpy = createSpyObj<DataTransfer>('DataTransfer', ['getData']);
  const inputEventSpy = createSpyObj<MatChipInputEvent>('MatChipInputEvent', [], ['input', 'value']);
  const selectEventSpy = createSpyObj<MatAutocompleteSelectedEvent>('MatAutocompleteSelectedEvent', [], ['option']);
  const triggerSpy = createSpyObj<MatAutocompleteTrigger>('MatAutocompleteTrigger', ['openPanel', 'closePanel'], ['_onChange']);
  const autoSpy = createSpyObj<MatAutocomplete>('MatAutocomplete', [], ['isOpen']);
  const elementSpy = createSpyObj<ElementRef<HTMLInputElement>>('ElementRef', [], ['nativeElement']);
  const inputElementSpy = createSpyObj<HTMLInputElement>('HTMLInputElement', ['blur'], ['value', 'tagName']);
  const optionSpy = createSpyObj<_MatOptionBase>('_MatOptionBase', [], ['value']);
  const keyboardSpy = createSpyObj<KeyboardEvent>('KeyboardEvent', [], ['target']);
  const focusSpy = createSpyObj<FocusEvent>('FocusEvent', [], ['relatedTarget']);
  const choice = new Choice('test');
  const choices = [choice];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        PipesModule
      ],
      declarations: [ SelectListComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectListComponent);
    component = fixture.componentInstance;
    component.isReadOnly = false;
    fixture.detectChanges();
    component.choiceInput = elementSpy;
    component.matAutocomplete = autoSpy;
    component.acTrigger = triggerSpy;

    getSpyProperty(elementSpy, 'nativeElement').and.returnValue(inputElementSpy);
    getSpyProperty(selectEventSpy, 'option').and.returnValue(optionSpy);
    getSpyProperty(clipboardEventSpy, 'clipboardData').and.returnValue(dataTransferSpy);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should initialize the autoComplete control', () => {
      const comp = new SelectListComponent();
      const initSpy = spyOn(comp, 'initAutoComplete');
      comp.ngOnInit();
      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('getSelectionText()', () => {
    it('should return comma-delimited list', () => {
      component.selections = [{label: 'test 1'} as Choice, {label: 'test 2'} as Choice];
      const result = component.getSelectionText();
      expect(result).toEqual('test 1, test 2');
    });
  });

  describe('initAutoComplete()', () => {
    let filterSpy;
    beforeEach(() => {
      filterSpy = spyOn<any>(component, '_filter').and.returnValue(choices);
      component.choicesList = choices;
    });

    it('handles string inputs', () => {
      component.formControl.setValue('test');
      component.formControl.updateValueAndValidity({emitEvent: true});
      component.filteredChoices$.pipe(skip(1)).subscribe(result => {
        expect(filterSpy).toHaveBeenCalledWith('test');
        expect(result).toEqual(choices);
      });
    });

    it('handles Choice input', () => {
      component.formControl.setValue(choice);
      component.formControl.updateValueAndValidity({emitEvent: true});
      component.filteredChoices$.subscribe(result => {
        expect(filterSpy).toHaveBeenCalledWith('test');
        expect(result).toEqual(choices);
      });
    });

    it('handles null input', () => {
      component.formControl.setValue(null);
      component.formControl.updateValueAndValidity({emitEvent: true});
      component.filteredChoices$.subscribe(result => {
        expect(filterSpy).not.toHaveBeenCalled();
        expect(result).toEqual(choices);
      });
    });
  });

  describe('writeValue()', () => {
    it('set pre-selected value', () => {
      component.writeValue(choices);
      expect(component.selections).toEqual(choices);
    });

    it('set empty value', () => {
      component.writeValue(null);
      expect(component.selections).toEqual([]);
    });
  });

  describe('registerOnChange()', () => {
    it('set onChange function', () => {
      const fn = () => {};
      component.registerOnChange(fn);
      expect(component.onChange).toEqual(fn);
    });
  });

  describe('registerOnTouched()', () => {
    it('set onTouched function', () => {
      const fn = () => {};
      component.registerOnTouched(fn);
      expect(component.onTouched).toEqual(fn);
    });
  });

  describe('handleChoiceUpdate()', () => {
    it('set selections and emit', () => {
      component.handleChoiceUpdate(choices);
      expect(component.selections).toEqual(choices);
      component.selectionChange.subscribe(result => {
        expect(result).toEqual(choices);
      });
    });
  });

  describe('add()', () => {
    let controlSpy;
    let updateSpy;
    beforeEach(() => {
      controlSpy = spyOn(component.formControl, 'setValue');
      controlSpy.calls.reset();
      updateSpy = spyOn(component, 'handleChoiceUpdate');
      setSpyProperty(inputElementSpy, 'value').calls.reset();
    });

    it('adds matched value to selectedChoices', () => {
      getSpyProperty(inputEventSpy, 'input').and.returnValue(inputElementSpy);
      getSpyProperty(inputEventSpy, 'value').and.returnValue('test');
      getSpyProperty(autoSpy, 'isOpen').and.returnValue(false);
      component.disableAutoComplete = false;
      component.selectedChoices = [];
      const filterSpy = spyOn<any>(component, '_filter').and.returnValue(choices);

      component.add(inputEventSpy);
      expect(filterSpy).toHaveBeenCalledWith('test', false);
      expect(component.selectedChoices).toEqual(choices);
      expect(updateSpy).toHaveBeenCalledWith(choices);
      expect(setSpyProperty(inputElementSpy, 'value')).toHaveBeenCalledWith('');
      expect(controlSpy).toHaveBeenCalledWith(null);
    });

    it('ignores duplicate values', () => {
      getSpyProperty(inputEventSpy, 'input').and.returnValue(inputElementSpy);
      getSpyProperty(inputEventSpy, 'value').and.returnValue('test');
      getSpyProperty(autoSpy, 'isOpen').and.returnValue(false);
      component.disableAutoComplete = false;
      component.selectedChoices = choices;
      const filterSpy = spyOn<any>(component, '_filter').and.returnValue(choices);

      component.add(inputEventSpy);
      expect(filterSpy).toHaveBeenCalledWith('test', false);
      expect(updateSpy).not.toHaveBeenCalledWith();
    });

    it('handles null values', () => {
      getSpyProperty(inputEventSpy, 'input').and.returnValue(null);
      getSpyProperty(inputEventSpy, 'value').and.returnValue(null);
      getSpyProperty(autoSpy, 'isOpen').and.returnValue(false);
      component.disableAutoComplete = false;
      const filterSpy = spyOn<any>(component, '_filter').and.returnValue(choices);

      component.add(inputEventSpy);
      expect(filterSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalledWith();
      expect(setSpyProperty(inputElementSpy, 'value')).not.toHaveBeenCalled();
    });

    it('adds manual entry to selectedChoices', () => {
      getSpyProperty(inputEventSpy, 'input').and.returnValue(inputElementSpy);
      getSpyProperty(inputEventSpy, 'value').and.returnValue('test');
      getSpyProperty(autoSpy, 'isOpen').and.returnValue(false);
      component.disableAutoComplete = true;
      component.selectedChoices = [];
      const filterSpy = spyOn<any>(component, '_filter').and.returnValue([]);

      component.add(inputEventSpy);
      expect(filterSpy).toHaveBeenCalledWith('test', true);
      expect(component.selectedChoices).toEqual(choices);
      expect(updateSpy).toHaveBeenCalledWith(choices);
    });

    it('handles when autocomplete list is still open', () => {
      getSpyProperty(autoSpy, 'isOpen').and.returnValue(true);

      component.add(inputEventSpy);
      expect(updateSpy).not.toHaveBeenCalledWith();
      expect(controlSpy).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    let handleSpy;
    let emitSpy;
    const choice2 = new Choice('test2');
    beforeEach(() => {
      handleSpy = spyOn(component, 'handleChoiceUpdate');
      emitSpy = spyOn(component.searchValueChange, 'emit');
    });

    it('remove selected choice', () => {
      component.selectedChoices = [choice, choice2];
      component.remove(choice2);
      expect(handleSpy).toHaveBeenCalledWith([choice]);
      expect(emitSpy).not.toHaveBeenCalledWith();
    });

    it('handles empty list', () => {
      component.selectedChoices = [];
      component.remove(choice2);
      expect(handleSpy).not.toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('');
    });
  });

  describe('selected()', () => {
    let valueSpy;
    let handleSpy;
    beforeEach(() => {
      valueSpy = spyOn(component.formControl, 'setValue');
      handleSpy = spyOn(component, 'handleChoiceUpdate');
      getSpyProperty(optionSpy, 'value').and.returnValue(choice);
    });

    it('adds given option to selected choices', () => {
      component.selectedChoices = [];
      getSpyProperty(optionSpy, 'value').and.returnValue(choice);
      component.selected(selectEventSpy);
      expect(setSpyProperty(inputElementSpy, 'value')).toHaveBeenCalledWith('');
      expect(inputElementSpy.blur).toHaveBeenCalled();
      expect(valueSpy).toHaveBeenCalledWith(null);
      expect(handleSpy).toHaveBeenCalledWith([choice]);
    });

    it('handles duplicate entries', () => {
      component.selectedChoices = [choice];
      component.selected(selectEventSpy);
      expect(handleSpy).toHaveBeenCalledWith([choice]);
    });
  });

  describe('_filter()', () => {
    it('should return case-insensitive matches', () => {
      component.choicesList = choices;
      const result = component['_filter']('te');
      expect(result).toEqual(choices);
    });

    it('should return exact matches', () => {
      component.choicesList = choices;
      const result = component['_filter']('test', true);
      expect(result).toEqual(choices);
    });

    it('should handle null choices', () => {
      component.choicesList = null;
      const result = component['_filter']('test');
      expect(result).toEqual([]);
    });
  });

  describe('onKey()', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = spyOn(component.searchValueChange, 'emit');
      getSpyProperty(keyboardSpy, 'target').and.returnValue(inputElementSpy);
    });

    it('emit keystroke', () => {
      getSpyProperty(inputElementSpy, 'value').and.returnValue('A');
      component.onKey(keyboardSpy);
      expect(emitSpy).toHaveBeenCalledWith('A');
    });

    it('handle empty key', () => {
      getSpyProperty(inputElementSpy, 'value').and.returnValue('');
      component.onKey(keyboardSpy);
      expect(emitSpy).toHaveBeenCalledWith('');
    });

    it('handle non-alphanumeric key', () => {
      getSpyProperty(inputElementSpy, 'value').and.returnValue('?');
      component.onKey(keyboardSpy);
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onPaste()', () => {
    it('handles data from clipboard', () => {
      dataTransferSpy.getData.and.returnValue(' test ');
      const valueSpy = spyOn(component.formControl, 'setValue');
      const emitSpy = spyOn(component.searchValueChange, 'emit');
      component.onPaste(clipboardEventSpy);
      expect(setSpyProperty(inputElementSpy, 'value')).toHaveBeenCalledWith('test');
      expect(valueSpy).toHaveBeenCalledWith('test');
      expect(emitSpy).toHaveBeenCalledWith(' test ');
    });
  });

  describe('onFocus()', () => {
    const changeSpy = createSpy('changeSpy', (a) => {});
    beforeEach(() => {
      getSpyProperty(triggerSpy, '_onChange').and.returnValue(changeSpy);
      changeSpy.calls.reset();
      triggerSpy.openPanel.calls.reset();
    });

    it('opens the select list panel if no selections exist', () => {
      component.selections = [];
      component.multiSelect = false;
      component.formControl.setValue('test');
      component.onFocus();
      expect(changeSpy).toHaveBeenCalledWith('test');
      expect(triggerSpy.openPanel).toHaveBeenCalled();
    });

    it('opens the select list panel if multiSelect enabled', () => {
      component.selections = choices;
      component.multiSelect = true;
      component.formControl.setValue(null);
      component.onFocus();
      expect(changeSpy).toHaveBeenCalledWith('');
      expect(triggerSpy.openPanel).toHaveBeenCalled();
    });

    it('does not open the panel if selections exist and not multiSelect', () => {
      component.selections = choices;
      component.multiSelect = false;
      component.onFocus();
      expect(changeSpy).not.toHaveBeenCalled();
      expect(triggerSpy.openPanel).not.toHaveBeenCalled();
    });
  });

  describe('addOnBlur()', () => {
    let addSpy;
    beforeEach(() => {
      addSpy = spyOn(component, 'add');
      getSpyProperty(inputElementSpy, 'value').and.returnValue('test');
      triggerSpy.closePanel.calls.reset();
    });

    it('adds entered text on blur if form is valid', () => {
      spyOnProperty(component.formControl, 'valid').and.returnValue(true);
      getSpyProperty(focusSpy, 'relatedTarget').and.returnValue(inputElementSpy);
      getSpyProperty(inputElementSpy, 'tagName').and.returnValue('TEST');
      component.addOnBlur(focusSpy);
      expect(triggerSpy.closePanel).toHaveBeenCalled();
      expect(addSpy).toHaveBeenCalledWith({input: inputElementSpy, value: 'test'});
    });

    it('does not add entered text if there is an error', () => {
      spyOnProperty(component.formControl, 'valid').and.returnValue(false);
      getSpyProperty(focusSpy, 'relatedTarget').and.returnValue(inputElementSpy);
      getSpyProperty(inputElementSpy, 'tagName').and.returnValue('TEST');
      component.addOnBlur(focusSpy);
      expect(triggerSpy.closePanel).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('not add input if user selects an option in the list', () => {
      spyOnProperty(component.formControl, 'valid').and.returnValue(true);
      getSpyProperty(focusSpy, 'relatedTarget').and.returnValue(inputElementSpy);
      getSpyProperty(inputElementSpy, 'tagName').and.returnValue('MAT-OPTION');
      component.addOnBlur(focusSpy);
      expect(triggerSpy.closePanel).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('handles null target', () => {
      spyOnProperty(component.formControl, 'valid').and.returnValue(true);
      getSpyProperty(focusSpy, 'relatedTarget').and.returnValue(null);
      component.addOnBlur(focusSpy);
      expect(triggerSpy.closePanel).toHaveBeenCalled();
      expect(addSpy).toHaveBeenCalledWith({input: inputElementSpy, value: 'test'});
    });
  });

  describe('ngOnDestroy()', () => {
    it('emits on observable', () => {
      const nextSpy = spyOn(component.destroy$, 'next');
      const unsubSpy = spyOn(component.destroy$, 'unsubscribe');
      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalledWith(true);
      expect(unsubSpy).toHaveBeenCalled();
    });
  });
});

function getSpyProperty<T, K extends keyof T>(
  spyObj: jasmine.SpyObj<T>,
  propName: K
): jasmine.Spy<() => T[K]> {
  return Object.getOwnPropertyDescriptor(spyObj, propName)?.get as jasmine.Spy<() => T[K]>;
}

function setSpyProperty<T, K extends keyof T>(
  spyObj: jasmine.SpyObj<T>,
  propName: K
): jasmine.Spy<(v) => {}> {
  return Object.getOwnPropertyDescriptor(spyObj, propName)?.set as jasmine.Spy<(v) => {}>;
}
