# Admin Setup Guide - Kunnathur Carry Bee

## Database Migration Complete

The database has been successfully backed up and migrated to Supabase with all existing functionalities preserved.

## Admin Authentication Setup

### Automatic Admin Role Assignment

The system is configured to automatically assign admin privileges to the following email:
- **Admin Email**: ravishangaraarya24@gmail.com
- **Password**: ravi$aarya2324

### How to Access Admin Panel

1. **Sign Up / Sign In**
   - Navigate to `/auth` page
   - Use the credentials above to sign up (first time) or sign in
   - The system will automatically assign admin role to this email

2. **Access Admin Panel**
   - After successful login, click on the user icon in the navbar
   - You will see "Admin Panel" option in the dropdown menu
   - Click to access the Admin Dashboard

## Admin Panel Features

### Dashboard (`/admin`)
Displays comprehensive statistics:
- Total Stores
- Total Products
- Total Orders
- Pending Orders
- Delivered Orders
- Total Revenue
- Recent Orders (last 5)

### Stores Management (`/admin/stores`)
- View all stores
- Add new stores
- Edit existing stores
- Delete stores
- All changes reflect immediately in the user-facing application

### Products Management (`/admin/products`)
- View all products across all stores
- Add new products
- Edit product details (name, description, price, category, stock status)
- Delete products
- Changes instantly visible to customers

### Orders Management (`/admin/orders`)
- View all customer orders
- Track order status (pending, delivered)
- View order details (customer info, delivery address, items)
- Update order status

### Offers Management (`/admin/offers`)
- Create promotional offers
- Edit offer details
- Delete offers
- **Toggle ON/OFF**: Use the switch to activate/deactivate offers
  - **Active offers**: Visible on the landing page
  - **Inactive offers**: Hidden from customers, stored in database

## Security Features

### Role-Based Access Control (RBAC)
- Only authenticated admin users can access admin routes
- Non-admin users are redirected to home page
- Unauthenticated users are redirected to login page

### Data Security
- Row Level Security (RLS) enabled on all tables
- Passwords hashed using Supabase Auth (bcrypt)
- Admin role stored securely in `user_roles` table
- All admin operations verified server-side

### Session Management
- Secure session storage with Supabase Auth
- Proper logout functionality clears session completely
- Auto-refresh tokens for persistent login

## Database Tables

All existing tables preserved:
- `stores` - Store information with location data
- `products` - Product catalog linked to stores
- `orders` - Customer orders with delivery tracking
- `order_items` - Individual order items
- `user_roles` - User role assignments (admin/user)
- `daily_offers` - Promotional offers and deals
- `product_requests` - Customer product requests

## Responsive Design

The Admin Panel is fully responsive:
- Desktop: Full sidebar navigation
- Mobile: Optimized layout with horizontal navigation
- Tablet: Adaptive grid layouts

## Important Notes

1. **First Time Setup**
   - If this is your first time, use the Sign Up tab with the admin credentials
   - The system will automatically create your account with admin privileges

2. **Password Security**
   - Change your password after first login from Supabase dashboard if needed
   - Never share admin credentials

3. **Offer Visibility**
   - Only offers marked as "Active" appear on the landing page
   - Inactive offers are hidden but retained in database
   - Toggle switch in Offers section controls visibility

4. **Data Persistence**
   - All changes are immediately saved to Supabase database
   - No data loss during migration
   - Real-time updates across all devices

## Troubleshooting

### Admin Panel Not Showing
- Ensure you're logged in with the correct admin email
- Wait a few seconds after login for role to be assigned
- Refresh the page if dropdown doesn't show Admin Panel option

### Cannot Access Admin Routes
- Verify you're using the correct email (ravishangaraarya24@gmail.com)
- Check that you're logged in (user icon should be visible)
- Try logging out and logging back in

### Offers Not Appearing on Landing Page
- Check if offer is marked as "Active" in Admin Offers section
- Verify offer was saved successfully (check for success toast)
- Refresh the landing page

## Support

For technical issues or questions, check:
- Browser console for error messages
- Supabase dashboard for database issues
- Network tab for API call failures

---

**System Status**: Fully Operational
**Database**: Migrated and Secured
**Admin Authentication**: Configured
**All Features**: Verified and Working
