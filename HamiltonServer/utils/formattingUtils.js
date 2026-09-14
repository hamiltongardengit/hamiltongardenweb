class FormattingUtils {
    constructor() {
    }

    formatNumber(number) {
        const integerPart = Math.floor(number);
        const decimalPart = Math.floor((number % 1) * 100);
        return `${integerPart}.${decimalPart.toString().padStart(2, '0')}`;
    }

    formatUtcDate(date) {
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const year = date.getUTCFullYear();
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        const seconds = String(date.getUTCSeconds()).padStart(2, "0");
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    formatDateWithDay(date) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const day = days[date.getDay()];
        const dayOfMonth = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();

        return `${day}, ${dayOfMonth}-${month}-${year}`;
    };
}

module.exports = FormattingUtils;


// class FormattingUtils {
//     static formatCurrency(amount, locale = 'en-US', currency = 'USD') {
//         return new Intl.NumberFormat(locale, {
//             style: 'currency',
//             currency,
//         }).format(amount);
//     }

//     static formatDecimal(number, decimalPlaces = 2, locale = 'en-US') {
//         return new Intl.NumberFormat(locale, {
//             minimumFractionDigits: decimalPlaces,
//             maximumFractionDigits: decimalPlaces,
//         }).format(number);
//     }

//     static formatNumber(number, locale = 'en-US') {
//         return new Intl.NumberFormat(locale).format(number);
//     }

//     static formatPercentage(number, decimalPlaces = 2, locale = 'en-US') {
//         return new Intl.NumberFormat(locale, {
//             style: 'percent',
//             minimumFractionDigits: decimalPlaces,
//             maximumFractionDigits: decimalPlaces,
//         }).format(number);
//     }

//     static formatDateTime(date, locale = 'en-US') {
//         return new Intl.DateTimeFormat(locale, {
//             dateStyle: 'short',
//             timeStyle: 'short',
//         }).format(date);
//     }

//     static formatDate(date, locale = 'en-US') {
//         return new Intl.DateTimeFormat(locale).format(date);
//     }

//     static formatTime(date, locale = 'en-US') {
//         return new Intl.DateTimeFormat(locale, {
//             timeStyle: 'short',
//         }).format(date);
//     }

//     static formatBoolean(value, trueText = 'Yes', falseText = 'No') {
//         return value ? trueText : falseText;
//     }

//     static formatPhone(phoneNumber, locale = 'en-US') {
//         return new Intl.NumberFormat(locale, {
//             style: 'tel',
//             type: 'text',
//         }).format(phoneNumber);
//     }

//     static formatAddress(address) {
//         const {
//             streetAddress,
//             city,
//             stateOrProvince,
//             postalCode,
//             country,
//         } = address;
//         return `${streetAddress}, ${city}, ${stateOrProvince} ${postalCode}, ${country}`;
//     }

//     static formatCreditCardNumber(creditCardNumber) {
//         return creditCardNumber.replace(/(\d{4})/g, '$1 ').trim();
//     }

//     static formatCreditCardExpiration(expirationDate) {
//         const [month, year] = expirationDate.split('/');
//         return `${month}/${year.slice(-2)}`;
//     }

//     static formatPercentageChange(currentValue, previousValue, decimalPlaces = 2) {
//         const change = (currentValue - previousValue) / previousValue;
//         const sign = change > 0 ? '+' : '';
//         return `${sign}${FormattingUtils.formatPercentage(change, decimalPlaces)}`;
//     }

//     static formatNumberRange(start, end, locale = 'en-US') {
//         const formattedStart = FormattingUtils.formatNumber(start, locale);
//         const formattedEnd = FormattingUtils.formatNumber(end, locale);
//         return `${formattedStart} - ${formattedEnd}`;
//     }

//     static formatFileSize(fileSizeInBytes) {
//         const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
//         let size = fileSizeInBytes;
//         let unitIndex = 0;
//         while (size > 1024 && unitIndex < units.length - 1) {
//             size /= 1024;
//             unitIndex++;
//         }
//         return `${FormattingUtils.formatDecimal(size)} ${units[unitIndex]}`;
//     }
// }

// module.exports = FormattingUtils;
