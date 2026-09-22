# Super Access Admin Panel

## Overview
The Super Access Admin Panel is a secure administrative interface for managing users and transaction requests.

## Access
- **URL**: `/superaccess`
- **Login Page**: `/superaccess/login`
- **Default Credentials**:
  - Username: `admin`
  - Password: `admin`

## Features

### 1. User Management
View and manage all users in the system with the following capabilities:
- **View All Users**: See a complete list of all registered users with their details
  - Name
  - Email
  - Role (USER/ADMIN)
  - Account Status (Active/Inactive)
  - Account Creation Date

- **Activate/Deactivate Accounts**: Toggle user account status
  - Active users can log in and access the platform
  - Inactive users cannot log in

- **Delete Users**: Permanently remove users from the system
  - Confirmation required before deletion
  - Deletes all associated data

### 2. Deposit/Withdraw Request Management
Review and approve/reject user deposit and withdrawal requests:

- **View Pending Requests**: See all pending deposit and withdraw requests from users
  - User information
  - Request type (DEPOSIT or WITHDRAW)
  - Amount
  - Request status (PENDING, APPROVED, REJECTED)
  - Request date

- **Approve Requests**: Approve pending deposit/withdraw requests
  - Updates transaction status to APPROVED
  - User can see the approval in their account

- **Reject Requests**: Reject pending deposit/withdraw requests
  - Updates transaction status to REJECTED
  - User is notified of rejection

## Security Features
- Session-based authentication using JWT tokens
- Admin credentials are separate from regular user accounts
- Protected routes that redirect to login if not authenticated
- Secure cookie-based session management
- 7-day session expiration

## Database Integration
The admin panel integrates with the application database to:
- Store and retrieve user information
- Track deposit/withdraw transaction requests
- Maintain audit trail of admin actions through transaction timestamps

## API Endpoints
- `POST /api/superaccess/login` - Authenticate as admin
- `POST /api/superaccess/logout` - Log out from admin panel
- `GET /api/superaccess/users` - Fetch all users
- `DELETE /api/superaccess/users` - Delete a user
- `POST /api/superaccess/users/toggle-active` - Toggle user active status
- `GET /api/superaccess/transactions` - Fetch all transactions
- `PUT /api/superaccess/transactions` - Update transaction status

## Usage

1. Navigate to `/superaccess/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin`
3. Click Login
4. Use the dashboard to:
   - Switch between "Users" and "Deposit/Withdraw Requests" tabs
   - Perform management actions as needed
5. Click "Logout" when finished

## Notes
- All admin actions are performed in real-time
- Changes to user status or transaction approvals are immediately reflected in the system
- Rejected or approved transactions retain their history in the database
