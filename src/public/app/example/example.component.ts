import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceProxy } from '../_service/serviceProxy.generated';
import { ServiceProxyTypes } from '../_service/serviceProxy.generated.types';
import { TranslateService } from '../i18n/translate.service';
import { Translate } from '../i18n/translate';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent {
    title: string;
    showNewSection: boolean;
    submitAttempt: boolean;
    form: FormGroup;
    examples: ServiceProxyTypes.Example[];

    constructor(
        public translate: TranslateService,
        private formBuilder: FormBuilder,
        private exampleProxy: ServiceProxy.ExampleProxy) {
    }

    private async ngOnInit() {
        this.title = this.translate.dictionary.Example.Title(
            15, this.translate.dictionary.Common.UpdateButton);
        this.examples = await this.exampleProxy.getExamples();

        // Build out the form
        this.form = this.formBuilder.group({
            name: [null, Validators.required],
            description: [null, Validators.maxLength(500)],
            year: [null, Validators.compose([
                Validators.required,
                Validators.pattern('[1-2][0-9][0-9][0-9]'),
                Validators.min(1989),
                Validators.max(2017)
            ])]
        });

        let i = 0;
        let interval = setInterval(() => {
            if (i < 100)
                i += Math.ceil(Math.random() * 6);

            if (i > 100)
                i = 100;

            if (i === 100)
                clearInterval(interval);

            this._progressBarPercentage = i;
        }, 500);
    }

    private _progressBarPercentage: number = 0;
    public get progressBarPercentage(): string {
        return `${this._progressBarPercentage}%`;
    }

    private _wantsCake: boolean = false;
    public get wantsCake(): boolean {
        return this._wantsCake;
    }
    public set wantsCake(value: boolean) {
        this._wantsCake = value;
        if (!this._wantsCake) {
            this._wantsIceCream = false;
        }
    }

    private _wantsIceCream: boolean = false;
    public get wantsIceCream(): boolean {
        return this._wantsIceCream;
    }
    public set wantsIceCream(value: boolean) {
        this._wantsIceCream = value;
    }

    public openNew() {
        this.showNewSection = true;
    }

    public switchLanguage(locale: string): void {
        this.translate.switchLanguage(locale);
    }

    public async delete(example: ServiceProxyTypes.Example) {
        await this.exampleProxy.deleteExample(example.exampleID);
        let index = this.examples.indexOf(example);
        this.examples.splice(index, 1);
    }

    public async submitForm(value: ServiceProxyTypes.Example) {
        if (!this.form.valid) {
            this.submitAttempt = true;
            return;
        }

        let id = await this.exampleProxy.createExample({
            name: value.name,
            description: value.description,
            year: value.year
        });

        // Set the exampleID and push it into the list.
        value.exampleID = id;
        this.examples.push(value);
        this._finish();
    }

    public cancelNew() {
        this._finish();
    }

    private _finish() {
        // Reset the form and hide it.
        this.form.reset();
        this.submitAttempt = false;
        this.showNewSection = false;
    }
}