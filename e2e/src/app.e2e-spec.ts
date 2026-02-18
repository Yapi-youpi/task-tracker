import { browser, by, element } from 'protractor';

describe('Task Tracker App', () => {
  beforeEach(() => browser.get('/'));

  it('should redirect to dashboard or auth', async () => {
    const url = await browser.getCurrentUrl();
    expect(url).toMatch(/\/(dashboard|auth)/);
  });

  it('should have app root', () => {
    expect(element(by.css('app-root')).isPresent()).toBe(true);
  });
});
