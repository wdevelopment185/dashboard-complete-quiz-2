# Complete CRUD Operations Guide

## Overview
This document describes all CRUD (Create, Read, Update, Delete) operations implemented in the User Management system.

---

## Backend API Endpoints

### 1. **CREATE** - Register New User
- **Endpoint**: `POST /api/register`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "country": "USA"
}
```
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### 2. **READ** Operations

#### 2.1 Get All Users
- **Endpoint**: `GET /api/users`
- **Description**: Retrieve all users from the database
- **Success Response**: `200 OK`
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "country": "USA",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### 2.2 Get Single User by ID
- **Endpoint**: `GET /api/users/:id`
- **Description**: Retrieve a specific user by their ID
- **URL Parameter**: `id` - User's MongoDB ObjectId
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "country": "USA",
    "createdAt": "2025-11-28T10:00:00.000Z",
    "updatedAt": "2025-11-28T10:00:00.000Z"
  }
}
```
- **Error Response**: `404 Not Found`
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. **UPDATE** Operations

#### 3.1 Update Single User by ID
- **Endpoint**: `PUT /api/users/:id`
- **Description**: Update a specific user's information
- **URL Parameter**: `id` - User's MongoDB ObjectId
- **Request Body** (all fields optional):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "country": "Canada"
}
```
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "country": "Canada",
    "createdAt": "2025-11-28T10:00:00.000Z",
    "updatedAt": "2025-11-28T12:00:00.000Z"
  }
}
```
- **Error Response**: `404 Not Found` or `400 Bad Request`

#### 3.2 Bulk Update Users by Criteria
- **Endpoint**: `PUT /api/bulk/:criteria`
- **Description**: Update multiple users matching a specific criteria (e.g., country)
- **URL Parameter**: `criteria` - Filter value (e.g., country name)
- **Request Body**:
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "country": "NewCountry"
}
```
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Successfully updated 5 users",
  "updatedCount": 5
}
```
- **Error Response**: `404 Not Found`
```json
{
  "success": false,
  "message": "No users found matching the criteria"
}
```

---

### 4. **DELETE** Operations

#### 4.1 Delete Single User by ID
- **Endpoint**: `DELETE /api/users/:id`
- **Description**: Delete a specific user by their ID
- **URL Parameter**: `id` - User's MongoDB ObjectId
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully",
  "deletedUser": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```
- **Error Response**: `404 Not Found`
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 4.2 Bulk Delete Users by Criteria
- **Endpoint**: `DELETE /api/bulk/:criteria`
- **Description**: Delete multiple users matching a specific criteria (e.g., country)
- **URL Parameter**: `criteria` - Filter value (e.g., country name)
- **Example**: `DELETE /api/bulk/USA` - Deletes all users from USA
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Successfully deleted 5 users",
  "deletedCount": 5
}
```
- **Error Response**: `404 Not Found`
```json
{
  "success": false,
  "message": "No users found matching the criteria"
}
```

---

## Frontend Implementation

### User Management Component Features

#### 1. **View All Users**
- Display users in a responsive table format
- Shows: Name, Email, Country, Join Date
- Real-time data fetching

#### 2. **Search & Filter**
- Search by: First Name, Last Name, Email
- Filter by: Country
- Live filtering without page reload

#### 3. **Add New User**
- Modal-based form
- Fields: First Name, Last Name, Email, Password, Country
- Real-time validation
- Success/Error notifications

#### 4. **Edit User**
- Click edit icon on any user row
- Pre-populated form with current data
- Update any field except password
- Instant feedback on success/failure

#### 5. **Delete Single User**
- Confirmation modal before deletion
- Shows user's full name
- Cannot be undone warning
- Success notification after deletion

#### 6. **Bulk Delete Users**
- Available when filtering by country
- "Delete All (Country)" button appears
- Confirmation modal with affected count
- Deletes all users matching the criteria

#### 7. **Refresh Data**
- Manual refresh button
- Re-fetches latest user data
- Updates table instantly

---

## Testing the CRUD Operations

### Using Thunder Client / Postman

#### 1. Create User
```
POST http://localhost:5000/api/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "country": "USA"
}
```

#### 2. Get All Users
```
GET http://localhost:5000/api/users
```

#### 3. Get Single User
```
GET http://localhost:5000/api/users/USER_ID_HERE
```

#### 4. Update User
```
PUT http://localhost:5000/api/users/USER_ID_HERE
Content-Type: application/json

{
  "firstName": "Updated",
  "country": "Canada"
}
```

#### 5. Delete User
```
DELETE http://localhost:5000/api/users/USER_ID_HERE
```

#### 6. Bulk Update by Country
```
PUT http://localhost:5000/api/bulk/USA
Content-Type: application/json

{
  "country": "United States"
}
```

#### 7. Bulk Delete by Country
```
DELETE http://localhost:5000/api/bulk/USA
```

---

## Frontend Usage

### Accessing User Management
1. Navigate to Dashboard (`http://localhost:3000/dashboard`)
2. Click "User Management" in the sidebar
3. All CRUD operations available through the UI

### Operation Steps

#### Add User
1. Click "Add User" button
2. Fill in the form
3. Click "Add User" to submit
4. User appears in table immediately

#### Edit User
1. Click edit icon (pencil) on any user row
2. Modify desired fields
3. Click "Update User"
4. Changes reflect immediately

#### Delete User
1. Click delete icon (trash) on any user row
2. Confirm deletion in modal
3. User removed from table

#### Bulk Delete
1. Select a country from filter dropdown
2. Click "Delete All (Country)" button
3. Confirm bulk deletion
4. All matching users deleted

---

## Security Features

1. **Email Validation**: Ensures unique email addresses
2. **Password Hashing**: All passwords encrypted with bcrypt
3. **Input Validation**: Required fields checked on backend
4. **Error Handling**: Comprehensive error messages
5. **Transaction Safety**: Database operations wrapped in try-catch

---

## File Structure

### Backend Files
```
BackEnd-Project/
├── myFiles/
│   ├── users.js         # Complete CRUD operations
│   ├── auth.js          # Authentication & token management
│   └── register.js      # User registration
├── models/
│   └── User.js          # User schema definition
└── index.js             # Main server file
```

### Frontend Files
```
FrontEnd-React-Assignment-1/
├── src/
│   ├── components/
│   │   └── UserManagement.jsx  # User management UI
│   ├── pages/
│   │   └── Dashboard.jsx       # Dashboard with navigation
│   └── services/
│       └── api.js              # API functions for CRUD
```

---

## Database Schema

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  country: String (optional),
  agreeToTerms: Boolean (default: false),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

---

## Common Issues & Solutions

### Issue: "User not found"
- **Cause**: Invalid user ID
- **Solution**: Ensure you're using the correct MongoDB ObjectId

### Issue: "Email already in use"
- **Cause**: Attempting to create/update with existing email
- **Solution**: Use a unique email address

### Issue: Table shows "No users found"
- **Cause**: Database is empty or connection issue
- **Solution**: Check backend connection, add test users

### Issue: Bulk delete not working
- **Cause**: No users match the criteria
- **Solution**: Verify users exist with the specified country

---

## Performance Considerations

1. **Pagination**: For large datasets, implement pagination
2. **Debouncing**: Search input debounced for performance
3. **Caching**: Consider implementing Redis for frequent queries
4. **Indexing**: Email field indexed for faster lookups

---

## Future Enhancements

1. Role-based access control (Admin/User)
2. Email verification system
3. Password reset functionality
4. Advanced filtering (date range, multiple criteria)
5. Export users to CSV/Excel
6. Import users from file
7. User activity logs
8. Soft delete (archive instead of permanent delete)

---

## API Response Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server-side error

---

## Support

For issues or questions, refer to:
- Backend logs in terminal
- Browser console for frontend errors
- Network tab for API request/response details

---

**Last Updated**: November 28, 2025
**Version**: 1.0.0
