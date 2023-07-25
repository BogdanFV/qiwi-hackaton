const axios = require('axios');
const { ArgumentParser } = require('argparse');
const { parseString } = require('xml2js');
const iconv = require('iconv-lite');

async function getCurrencyRates(code, date) {
    const formattedDate = date.split('-').reverse().join('/');
    const url = `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${formattedDate}`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const data = iconv.decode(response.data, 'win1251');

        parseString(data, (err, result) => {
            if (err) {
                console.log(`Error: Ошибка при парсинге XML: ${err.message}`);
                return;
            }
            const valutes = result.ValCurs.Valute;
            const valute = valutes.find(v => v.CharCode[0] === code);

            if (valute) {
                console.log(`${code} (${valute.Name[0]}): ${valute.Value[0]}`);
            } else {
                console.log(`Error: Такой код '${code}' не найден по указанной дате '${date}'`);
            }
        });
    } catch (error) {
        console.log(`Error: Ошибка при получении данных. ${error.message}`);
    }
}

if (require.main === module) {
    const parser = new ArgumentParser({
        description: 'Получить курс валюты по заданной дате.'
    });

    parser.add_argument('--code', { required: true, help: 'Код валюты в формате ISO 4217' });
    parser.add_argument('--date', { required: true, help: 'Дата в формате YYYY-MM-DD' });

    const args = parser.parse_args();
    const currencyCode = args.code;
    const date = args.date;

    getCurrencyRates(currencyCode, date);
}

module.exports = {
    getCurrencyRates
};
