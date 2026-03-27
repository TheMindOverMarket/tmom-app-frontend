/**
 * demo_safety.cy.ts
 * 
 * High-Fidelity UI Puppeteering Suite for the TMOM Demo.
 * This suite mocks all backend services to ensure the UI flows are bulletproof
 * and can be demonstrated regardless of server availability.
 */

describe('High-Fidelity UI Puppeteering (Demo Safety Suite)', () => {
  const MOCK_USER_ID = '1d4d88c7-bcd1-4813-8f34-59c9776e5b3f';
  const MOCK_PLAYBOOK_ID = 'pb-123';
  const MOCK_SESSION_ID = 'sess-456';

  beforeEach(() => {
    // Intercept Playbooks List
    cy.intercept('GET', '**/users/*/playbooks', {
      statusCode: 200,
      body: [
        {
          id: MOCK_PLAYBOOK_ID,
          name: 'Demo Playbook BTC',
          user_id: MOCK_USER_ID,
          original_nl_input: 'I am using BTC. Buy when EMA > Price.',
          generation_status: 'COMPLETED',
          is_active: false,
          created_at: new Date().toISOString()
        }
      ]
    }).as('listPlaybooks');

    // Intercept Playbook Details & Rules
    cy.intercept('GET', `**/playbooks/${MOCK_PLAYBOOK_ID}`, {
      id: MOCK_PLAYBOOK_ID,
      name: 'Demo Playbook BTC',
      generation_status: 'COMPLETED',
      original_nl_input: 'I am using BTC. Buy when EMA > Price.'
    }).as('getPlaybook');

    cy.intercept('GET', `**/playbooks/${MOCK_PLAYBOOK_ID}/rules`, {
      body: [
        { id: 'rule-1', name: 'EMA Cross', description: 'EMA 9 cross above Price', conditions: [{ metric: 'EMA', comparator: '>', value: '70000' }] }
      ]
    }).as('getRules');

    // Intercept Session Management
    cy.intercept('POST', '**/sessions/start', {
      id: MOCK_SESSION_ID,
      user_id: MOCK_USER_ID,
      playbook_id: MOCK_PLAYBOOK_ID,
      status: 'STARTED',
      start_time: new Date().toISOString()
    }).as('startSession');

    // Intercept Market Data
    cy.intercept('GET', '**/market-data/history*', {
      body: [
        { time: Math.floor(Date.now() / 1000) - 60, open: 70000, high: 71000, low: 69000, close: 70500 },
        { time: Math.floor(Date.now() / 1000), open: 70500, high: 72000, low: 70000, close: 71500 }
      ]
    }).as('getMarketHistory');

    // Mock WebSocket for Rule Engine
    cy.on('window:before:load', (win) => {
      let wsInstance: any;
      win.WebSocket = class MockWebSocket {
        url: string;
        onmessage: any;
        onopen: any;
        constructor(url: string) {
          this.url = url;
          wsInstance = this;
          setTimeout(() => { if (this.onopen) this.onopen(); }, 10);
        }
        send() {}
        close() {}
        static trigger(data: any) {
          if (wsInstance && wsInstance.onmessage) {
            wsInstance.onmessage({ data: JSON.stringify(data) });
          }
        }
      } as any;
    });
  });

  it('Flow 1 & 2: Visit /playbooks/new and Extract Rules', () => {
    cy.intercept('POST', '**/playbooks/ingest', {
      id: MOCK_PLAYBOOK_ID,
      name: 'Newly Ingested Playbook',
      generation_status: 'PENDING',
      original_nl_input: 'BTC strategy test'
    }).as('ingestPlaybook');

    cy.visit('/playbooks');
    cy.get('textarea').type('I am using BTC and want to buy on EMA cross.');
    cy.contains('button', 'INGEST PLAYBOOK').click();
    
    cy.wait('@ingestPlaybook');
    
    // Simulate background extraction completion
    cy.intercept('GET', `**/playbooks/${MOCK_PLAYBOOK_ID}`, {
      id: MOCK_PLAYBOOK_ID,
      name: 'Newly Ingested Playbook',
      generation_status: 'COMPLETED',
      original_nl_input: 'BTC strategy test'
    });

    cy.contains('Newly Ingested Playbook').click();
    cy.contains('STRATEGY INSPECTOR').should('be.visible');
    cy.contains('DETERMINISTIC RULESET').should('be.visible');
    cy.get('button').contains('ACTIVATE').should('be.visible');
  });

  it('Flow 3: Click "Start Session" and Navigate to Monitor', () => {
    cy.visit('/playbooks');
    cy.contains('ACTIVATE').first().click();
    cy.visit('/monitor');
    
    cy.intercept('GET', `**/playbooks/${MOCK_PLAYBOOK_ID}/rules`, {
        body: [{ id: 'rule-1', name: 'EMA Cross', conditions: [{ metric: 'EMA', value: '70000' }] }]
    });

    cy.contains('button', 'START LIVE SESSION').click();
    cy.wait('@startSession');
    cy.url().should('include', '/monitor');
    cy.contains('SUPERVISION ACTIVE').should('be.visible');
  });

  it('Flow 4, 5 & 6: Real-time Adherence/Deviation Visualization', () => {
    cy.visit('/monitor');
    cy.contains('button', 'START LIVE SESSION').click();

    // Flow 4 & 5: Mock market event stream
    cy.window().then((win: any) => {
      win.WebSocket.trigger({
        id: 'evt-1',
        timestamp: Math.floor(Date.now() / 1000),
        price: 71000,
        deviation: false,
        rule_evaluations: { 'rule-1': true },
        deviation_false: ['rule-1']
      });
    });

    // Verify Sidebar row
    cy.get('div').contains('ADHERENCE').should('be.visible');
    
    // Flow 6: Push deviation event
    cy.window().then((win: any) => {
      win.WebSocket.trigger({
        id: 'evt-2',
        timestamp: Math.floor(Date.now() / 1000) + 1,
        price: 72000,
        deviation: true,
        rule_evaluations: { 'rule-1': false },
        deviation_true: ['rule-1']
      });
    });

    // Assert Red X for deviation
    cy.get('svg[color="#ef4444"]').should('be.visible');
    
    // Push adherence event
    cy.window().then((win: any) => {
      win.WebSocket.trigger({
        id: 'evt-3',
        timestamp: Math.floor(Date.now() / 1000) + 2,
        price: 73000,
        deviation: false,
        rule_evaluations: { 'rule-1': true },
        deviation_false: ['rule-1']
      });
    });

    // Assert Green Check for adherence
    cy.get('svg[color="#10b981"]').should('be.visible');
  });

  it('Flow 7: Buy/Sell Execution and Notification', () => {
    cy.intercept('POST', '**/orders', {
      statusCode: 200,
      body: { status: 'filled', id: 'ord-123', symbol: 'BTC/USD', qty: 1 }
    }).as('placeOrder');

    cy.visit('/monitor');
    cy.contains('button', 'START LIVE SESSION').click();

    // Note: The UI has 'BUY' and 'SELL' buttons in the header/controls area
    cy.get('button').contains('BUY').click();
    cy.wait('@placeOrder');
    
    // Verify Order Filled notification (using standard toast component behavior)
    cy.contains('Order Filled').should('be.visible');
    cy.contains('BTC/USD').should('be.visible');
  });
});
