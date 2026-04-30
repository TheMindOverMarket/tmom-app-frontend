# TheMindOverMarket - Application Frontend

This repository houses the authenticated dashboard and trading interface for TheMindOverMarket.

## Architecture

- **Framework**: React + Vite
- **Language**: TypeScript
- **State/Routing**: React Router, React Context
- **Charting**: TradingView Lightweight Charts
- **Styling**: Minimal CSS (Canonical)

## Application State

The frontend is fully functional and integrates with the backend and Rule Engine. Features include:
- **Playbook Generation**: Chat with an LLM to generate rules dynamically, with streaming response.
- **Live Supervision**: Connects to the Rule Engine WebSocket to receive live evaluation events.
- **Deviation Engine UI**: Displays action-based and state-based deviations, along with LLM-generated reasoning and session analytics.
- **Session Analytics**: Allows users to load completed sessions and replay trading activity block by block with hydrated charts.
- **Mock Mode**: Built-in mock data generators for simulating live rule engine ticks during development.

## Usage

```bash
npm install
npm run dev
```
