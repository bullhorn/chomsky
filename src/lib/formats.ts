import { mergeDeep } from './object-assign-deep';
import { currencyOverridesMap } from './currency-overrides';

// Interface for defaults
export interface IFormatDefaults {
    number: Intl.NumberFormatOptions;
    currency: Intl.NumberFormatOptions;
    date: any;
}

/**
 * @name Formats
 * @description formats for dates, numbers and currencies
 * Number: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
 * Date:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
 * @class Formats
 */
export class Formats {
    // Format formatDefaults
    private defaults: IFormatDefaults = {
        number: {},
        currency: {},
        date: {}
    };
    // Current locale
    private locale: string;
    // Override currency to blanket change the currency behavior
    public overrideCurrency: string;
    // Override to force times to display in 24 hour
    public use24HourTime: boolean;

    constructor() {
        // Initially set the locale to the browser
        this.setLocale(window.navigator.language);
    }

    public override(overrides: any): void {
        if (overrides.locale) {
            this.setLocale(overrides.locale);
            delete overrides['locale'];
        }
        this.defaults = overrides;
    }

    public setLocale(locale: string): void {
        this.locale = locale;
    }

    public formatNumber(value: number, format?: Intl.NumberFormatOptions): string {
        let _format = mergeDeep({}, this.defaults.number, format);
        return new Intl.NumberFormat([this.locale, 'en-US'], _format).format(value);
    }

    public formatCurrency(value: number, format?: string | Intl.NumberFormatOptions): string {
        let _format: Intl.NumberFormatOptions = (typeof format === 'string') ? mergeDeep({}, { currency: format }, this.defaults.currency) : mergeDeep({}, format, this.defaults.currency);
        let options = mergeDeep({ style: 'currency', currency: 'USD' }, _format);
        if (this.overrideCurrency) {
            if (this.overrideCurrency === 'None') {
                return new Intl.NumberFormat([this.locale, 'en-US'], {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value);
            }
            options.currency = this.overrideCurrency;
        }

        let currencyValue: string = new Intl.NumberFormat([this.locale, 'en-US'], options).format(value);
        return currencyOverridesMap[options.currency] ? currencyValue.replace(options.currency, currencyOverridesMap[options.currency]) : currencyValue;
    }

    public formatDate(value: any, format?: string | Intl.DateTimeFormatOptions): string {
        let _value = value === null || value === undefined || value === '' ? new Date() : new Date(value);
        let shortHands = mergeDeep({}, this.defaults.date);
        let options: Intl.DateTimeFormatOptions = (typeof format === 'string') ? shortHands[format] : format;
        if (!options || Object.keys(options).length === 0) {
            options = shortHands.dateShort;
        }
        if (this.use24HourTime) {
            options.hour12 = false;
        }
        return new Intl.DateTimeFormat([this.locale, 'en-US'], options).format(_value);
    }

    public format(value: string, format?: string): string {
        if (!value) {
            return value;
        }
        switch (format) {
            case 'uppercase':
                return value.toUpperCase();
            case 'lowercase':
                return value.toLowerCase();
            case 'title':
                return value.replace(/\w\S*/g, txt => { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            case 'denormalize':
                return value.replace(/([A-Z])/g, ' $1').replace(/^./, str => { return str.toUpperCase(); });
            default:
                return value;
        }
    }
}
