const axios = require('axios');
const { getCurrencyRates } = require('./currency_rates');
jest.mock('axios');

describe('getCurrencyRates', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch currency rate and display the result', async () => {
        const responseData = `
      <ValCurs>
        <Valute>
          <CharCode>USD</CharCode>
          <Name>US Dollar</Name>
          <Value>75.25</Value>
        </Valute>
      </ValCurs>
    `;
        const currencyCode = 'USD';
        const date = '2023-07-25';
        const formattedDate = '25/07/2023';
        const mockedResponse = {
            data: responseData,
        };

        axios.get.mockResolvedValueOnce(mockedResponse);
        console.log = jest.fn();
        await getCurrencyRates(currencyCode, date);

        expect(axios.get).toHaveBeenCalledWith(
            `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${formattedDate}`,
            { responseType: 'arraybuffer' }
        );

        expect(console.log).toHaveBeenCalledWith('USD (US Dollar): 75.25');
    });

    test('should display an error if currency code is not found', async () => {
        const responseData = `
      <ValCurs>
        <Valute>
          <CharCode>EUR</CharCode>
          <Name>Euro</Name>
          <Value>89.50</Value>
        </Valute>
      </ValCurs>
    `;
        const currencyCode = 'USD';
        const date = '2023-07-25';
        const formattedDate = '25/07/2023';
        const mockedResponse = {
            data: responseData,
        };

        axios.get.mockResolvedValueOnce(mockedResponse);

        console.log = jest.fn();

        await getCurrencyRates(currencyCode, date);

        expect(axios.get).toHaveBeenCalledWith(
            `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${formattedDate}`,
            { responseType: 'arraybuffer' }
        );

        expect(console.log).toHaveBeenCalledWith(
            "Error: Такой код 'USD' не найден по указанной дате '2023-07-25'"
        );
    });

    test('should display an error if there is an error in the response', async () => {
        const currencyCode = 'USD';
        const date = '2023-07-25';
        const formattedDate = '25/07/2023';
        const errorMessage = 'Simulated error message';

        axios.get.mockRejectedValueOnce(new Error(errorMessage));

        console.log = jest.fn();

        await getCurrencyRates(currencyCode, date);

        expect(axios.get).toHaveBeenCalledWith(
            `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${formattedDate}`,
            { responseType: 'arraybuffer' }
        );

        expect(console.log).toHaveBeenCalledWith(`Error: Ошибка при получении данных. ${errorMessage}`);
    });
});
