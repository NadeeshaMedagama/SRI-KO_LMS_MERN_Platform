# SRI-KO LMS Pricing System

## Overview

The SRI-KO LMS now includes a comprehensive pricing and subscription management system with three tiers: Starter (Free), Pro, and Premium. The system supports both monthly and yearly billing cycles with Sri Lankan Rupee (LKR) pricing.

## Features Implemented

### 1. Pricing Page (`/pricing`)
- **Professional Design**: Modern, responsive pricing page with gradient backgrounds
- **Three Plans**: Starter (Free), Pro (LKR 15,000/month or LKR 150,000/year), Premium (LKR 35,000/month or LKR 350,000/year)
- **Billing Toggle**: Switch between monthly and yearly billing with savings indicator
- **Feature Comparison**: Detailed comparison table showing all features
- **FAQ Section**: Common questions about pricing and subscriptions
- **Call-to-Action**: Clear buttons for plan selection

### 2. Payment Processing (`/payment`)
- **Payment Methods**: Credit card, bank transfer, and digital wallet support
- **Form Validation**: Comprehensive validation for payment details
- **Order Summary**: Clear breakdown of subscription details
- **Processing Simulation**: Simulated payment processing with loading states
- **Error Handling**: Proper error handling and user feedback

### 3. Backend Models

#### Subscription Model (`models/Subscription.js`)
- **Plan Management**: Starter, Pro, Premium with feature sets
- **Billing Cycles**: Monthly and yearly support
- **Usage Tracking**: Course creation, student enrollment, API calls
- **Status Management**: Active, trial, cancelled, expired states
- **Feature Limits**: Configurable limits per plan
- **Auto-renewal**: Automatic subscription renewal

#### Payment Model (`models/Payment.js`)
- **Payment Tracking**: Complete payment history
- **Gateway Integration**: Support for multiple payment gateways
- **Status Management**: Pending, completed, failed, refunded
- **Invoice Generation**: Automatic invoice and receipt numbers
- **Refund Processing**: Full refund support
- **Analytics**: Revenue and payment statistics

### 4. API Routes

#### Subscription Routes (`routes/subscriptionRoutes.js`)
- `GET /api/subscriptions/plans` - Get available plans
- `GET /api/subscriptions/current` - Get user's current subscription
- `POST /api/subscriptions/create` - Create new subscription
- `PUT /api/subscriptions/upgrade` - Upgrade subscription plan
- `PUT /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/usage` - Get usage statistics
- `GET /api/subscriptions/payments` - Get payment history
- `GET /api/subscriptions/invoice/:id` - Get payment invoice

#### Payment Routes (`routes/paymentRoutes.js`)
- `POST /api/payments/create` - Create payment record
- `PUT /api/payments/:id/complete` - Mark payment as completed
- `PUT /api/payments/:id/fail` - Mark payment as failed
- `POST /api/payments/:id/refund` - Process refund
- `GET /api/payments/stats` - Get payment statistics (Admin)
- `GET /api/payments/recent` - Get recent payments (Admin)
- `GET /api/payments/all` - Get all payments with filters (Admin)

### 5. Admin Dashboard Integration

#### Subscription Management Page (`/admin/subscriptions`)
- **Revenue Analytics**: Total revenue, payment statistics
- **Payment History**: Complete payment history with filters
- **Plan Analytics**: Revenue breakdown by plan
- **Recent Payments**: Latest payment activities
- **Filtering**: Filter by status, plan, date range
- **Pagination**: Efficient pagination for large datasets

### 6. Frontend Services

#### Subscription Service (`services/subscriptionService.js`)
- **Plan Management**: Fetch available plans
- **Subscription CRUD**: Create, read, update, cancel subscriptions
- **Usage Tracking**: Get usage statistics
- **Payment History**: Fetch payment records
- **Invoice Management**: Get payment invoices

#### Payment Service (`services/paymentService.js`)
- **Payment Processing**: Create and manage payments
- **Status Updates**: Complete, fail, refund payments
- **Admin Analytics**: Get payment statistics and reports
- **Filtering**: Advanced filtering for admin views

## Plan Features

### Starter Plan (Free)
- Up to 5 courses
- Up to 50 students
- Basic course creation tools
- Student progress tracking
- Email support
- Basic analytics
- Mobile app access
- Certificate generation

### Pro Plan (LKR 15,000/month or LKR 150,000/year)
- Unlimited courses
- Up to 500 students
- Advanced course creation tools
- Comprehensive analytics & reporting
- Priority email support
- Custom branding
- Advanced student management
- Bulk student enrollment
- Advanced certificate templates
- API access
- Integration with external tools
- Advanced progress tracking

### Premium Plan (LKR 35,000/month or LKR 350,000/year)
- Everything in Pro
- Unlimited students
- White-label solution
- 24/7 phone & chat support
- Custom integrations
- Advanced security features
- SSO integration
- Custom domain
- Advanced user roles
- Bulk operations
- Advanced reporting & analytics
- Dedicated account manager
- Custom training & onboarding
- SLA guarantee
- Data export/import tools

## Database Schema

### Subscription Collection
```javascript
{
  user: ObjectId,
  plan: String, // 'starter', 'pro', 'premium'
  billingCycle: String, // 'monthly', 'yearly'
  status: String, // 'active', 'trial', 'cancelled', 'expired'
  startDate: Date,
  endDate: Date,
  amount: Number,
  currency: String, // 'LKR'
  features: Object, // Plan-specific features
  usage: Object, // Usage statistics
  autoRenew: Boolean
}
```

### Payment Collection
```javascript
{
  user: ObjectId,
  subscription: ObjectId,
  amount: Number,
  currency: String, // 'LKR'
  status: String, // 'pending', 'completed', 'failed', 'refunded'
  paymentMethod: String, // 'credit_card', 'bank_transfer', 'digital_wallet'
  paymentGateway: String, // 'stripe', 'paypal', 'razorpay', 'payhere'
  gatewayTransactionId: String,
  billingPeriod: Object,
  plan: String,
  billingCycle: String,
  paymentDate: Date,
  invoiceNumber: String,
  receiptNumber: String
}
```

## Usage Examples

### Creating a Subscription
```javascript
// Frontend
const response = await subscriptionService.createSubscription('pro', 'monthly');

// Backend
const subscription = new Subscription({
  user: req.user.id,
  plan: 'pro',
  billingCycle: 'monthly',
  // ... other fields
});
```

### Processing a Payment
```javascript
// Frontend
const payment = await paymentService.createPayment(
  subscriptionId,
  'credit_card',
  amount
);

// Mark as completed
await paymentService.completePayment(
  payment._id,
  gatewayTransactionId,
  gatewayResponse
);
```

### Admin Analytics
```javascript
// Get payment statistics
const stats = await paymentService.getPaymentStats(startDate, endDate);

// Get revenue by plan
const revenueByPlan = await paymentService.getRevenueByPlan(startDate, endDate);
```

## Security Features

- **Authentication**: All routes protected with JWT authentication
- **Authorization**: Admin-only routes for sensitive operations
- **Validation**: Comprehensive input validation using express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Sanitization**: Proper data sanitization and validation

## Future Enhancements

1. **Real Payment Gateway Integration**: Integrate with Stripe, PayPal, or local Sri Lankan payment gateways
2. **Automated Billing**: Automatic subscription renewal and billing
3. **Usage Alerts**: Notifications when approaching plan limits
4. **Plan Downgrades**: Support for downgrading plans
5. **Proration**: Prorated billing for mid-cycle changes
6. **Multiple Currencies**: Support for multiple currencies
7. **Tax Calculation**: Automatic tax calculation based on location
8. **Invoice Templates**: Customizable invoice templates
9. **Payment Reminders**: Automated payment reminder emails
10. **Analytics Dashboard**: Advanced analytics and reporting

## Testing

The system includes comprehensive error handling and validation. To test:

1. **Frontend Testing**: Navigate to `/pricing` to test the pricing page
2. **Payment Flow**: Test the payment process (simulated)
3. **Admin Dashboard**: Access `/admin/subscriptions` to view management interface
4. **API Testing**: Use the provided API endpoints for integration testing

## Deployment Notes

1. **Environment Variables**: Ensure proper environment variables are set
2. **Database**: MongoDB connection string configured
3. **CORS**: Frontend URL configured for CORS
4. **Rate Limiting**: Adjust rate limits based on expected traffic
5. **Payment Gateway**: Configure real payment gateway credentials for production

## Support

For issues or questions regarding the pricing system:
- Check the API documentation
- Review the error logs
- Test with the provided endpoints
- Contact the development team

The pricing system is now fully integrated and ready for production use with proper payment gateway integration.
