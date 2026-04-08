# The Mind Over Market (TMOM) Frontend Features

This document outlines the capabilities and features available in the TMOM frontend application.

## Authentication
- **Basic Login & Registration**: Users can create an account and log in using an email address. 
  - *Note: This is a basic authentication system designed for local testing and lightweight usage. Passwords are not yet enforced.*
- **Session Persistence**: Sessions are preserved across page reloads using browser `sessionStorage` containing the authenticated User ID.

## Playbook Management
- **View Playbooks**: Dashboard showing all active algorithms/strategies attached to the user.
- **Auto-Sync Options**: Capabilities to quickly view the playbooks synced with live models.
- **Playbook Context**: A dedicated `PlaybookContext` maintains active context of the currently viewing playbook, making navigation seamless across pages.

## Monitoring & Supervision
- **Live Monitoring Dashboard**: Websocket integration with the backend Rule-Engine allows live streaming of logic adherence and trading deviation scores.
- **Execution Visibility**: Active strategy monitoring with visual feedback directly synced to market movements and model inferences.

## Analytics & Sessions
- **Session Replay**: Allows reviewing previous sessions to analyze trading performance offline.
- **Analytics View**: Visualizes aggregate metrics (like deviation scores over time) using various real-time streams and data grids.

## Administrative Tools
- **Admin Dashboard**: Restricted visibility tools specifically for `ADMIN` role users, enabling oversight across multiple user accounts and active running playbooks.

## Architecture
- **Tech Stack**: React 18, React Router for navigation, Context API for state management, Vanilla CSS/custom sleek design blocks.
- **Design Strategy**: Uses dynamic UI features like modern subtle gradients, clear aesthetic lines, and a dedicated layout split (Navigation Sidebar vs Main Content Area).
