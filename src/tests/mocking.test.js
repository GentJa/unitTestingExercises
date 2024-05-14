import { vi, it, expect, describe } from 'vitest';
import { getPriceInCurrency, getShippingInfo, renderPage, submitOrder } from '../../src/mocking'
import { getExchangeRate } from '../libs/currency';
import { getShippingQuote } from '../libs/shipping';
import { trackPageView } from '../libs/analytics';
import { charge } from '../libs/payment';


vi.mock('../../src/libs/currency.js')
vi.mock('../../src/libs/shipping.js')
vi.mock('../../src/libs/analytics.js');
vi.mock('../../src/libs/payment.js');

describe('test suite', () => {
    const add = vi.fn();
    const subtract = vi.fn();

    it('Add', () => {
        add.mockImplementation((a, b) => a + b);
        expect(add(5, 3)).toBe(8)
    })

    it('Subtract', () => {
        subtract.mockImplementation((a, b) => a - b);
        expect(subtract(5, 3)).toBe(2);
    })
})

describe('test suite', () => {
    it('send message', () => {
        const sendText = vi.fn();
        sendText.mockReturnValue('ok');
        const result = sendText('message');
        expect(sendText).toHaveBeenCalledWith('message');
        expect(result).toBe('ok');
    })
})


describe('getPriceInCurrent', () => {
    it("should return price in current currency", () => {
        vi.mocked(getExchangeRate).mockReturnValue(0.85)
        const price = getPriceInCurrency(100, 'AUD');
        console.log(price);
        expect(price).toBeCloseTo(85)
    })
})

describe('getShippingInfo', () => {
    it("should return shipping unavaliable if quote cannot be fetched", () => {
        vi.mocked(getShippingQuote).mockReturnValueOnce(null);
        let result = getShippingInfo('London')
        expect(result).toBe('Shipping Unavailable');
    })

    it("should return shipping info if quote can be fetched", () => {
        vi.mocked(getShippingQuote).mockReturnValueOnce({ cost: 10, estimatedDays: 2 });
        let result = getShippingInfo('London');
        expect(result).toMatch('$10');
        expect(result).toMatch(/2 days/i)
        expect(result).toMatch(/shipping cost: \$10 \(2 days\)/i);
    })
})


describe('renderPage', () => {
    it("should return correct content", async () => {
        const reuslt = await renderPage();
        expect(reuslt).toMatch(/content/i);
    })

    it("should be call analytics", async () => {
        await renderPage();
        expect(trackPageView).toHaveBeenCalledWith('/home');
    })
})

describe.only('submitOrder', () => {
    const order = { totalAmount: 10 };
    const creditCard = { creditCardNumber: '1234' };
    it("should charge the customer ", async () => {
        vi.mocked(charge).mockResolvedValue({ status: 'success' })
        await submitOrder(order, creditCard);
        expect(charge).toHaveBeenCalledWith(creditCard, order.totalAmount)
    })
    it("should return true when payment is succesful", async () => {
        vi.mocked(charge).mockResolvedValue({ status: 'success' });
        const result = await submitOrder(order, creditCard);
        expect(result).toEqual({success: true});
    })

    it("should return false when payment is unsuccesful", async () => {
        vi.mocked(charge).mockResolvedValue({ status: 'failed' });
        const result = await submitOrder(order, creditCard);
        expect(result).toEqual({success: false, error:'payment_error'});
    })
})