# PayPal Integration Setup - IMPORTANT!

## ✅ What's Been Completed

1. **PayPal SDK Installed**: Both client and server SDKs
2. **PayPal Configuration**: Created `src/lib/paypal.ts` for server-side operations
3. **API Endpoints Created**:
   - `/api/paypal/create-order` - Creates PayPal order
   - `/api/paypal/capture-order` - Captures payment and creates transaction records
4. **Donation Form Updated**: Now uses PayPal buttons instead of direct form submission
5. **Transaction Tracking**: Automatically creates Transaction records with:
   - Payment details (orderId, payerId, amount, fees)
   - Platform fee calculation (R2 + 3%)
   - Donor and recipient information
   - Separate FEE transaction for revenue tracking
6. **Database Updated**: Added `paymentMethod` and `paymentStatus` fields to Donation model

## 🔧 REQUIRED: Add Environment Variables to Vercel

**You MUST add these environment variables to your Vercel project:**

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add these three variables:

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AQPN60nieRY7CIBihngM7EFhT6CAw9wVXN3zNiG8FMyY1mKW5JCqZzvjMSYfCYnKGfXrzAc0PPIeHBn2
PAYPAL_CLIENT_SECRET=EKo__FuiGqPkwBAh8Py2STDecEBE5HlEnjYnOGNWKWPz0XRzis4yfQJTRhot35lO4tTwLfCzh9b4dXK1
PAYPAL_MODE=sandbox
```

3. **Select "All Environments"** for each variable
4. **Redeploy** your site after adding the variables

## 🧪 Testing the Integration

### Sandbox Test Flow:
1. Navigate to any request: `/requests/[requestId]`
2. Enter a donation amount (e.g., $25)
3. Click "Continue to PayPal"
4. PayPal buttons will appear
5. Use PayPal Sandbox account to test:
   - **Buyer Account**: Use your PayPal sandbox test buyer account
   - **Or**: Click "Create Account" in PayPal sandbox window

### What Happens:
1. User clicks amount → "Continue to PayPal" button appears
2. PayPal buttons load (yellow "PayPal" button)
3. User completes PayPal payment
4. System captures payment and creates:
   - ✅ Donation record (in Donation table)
   - ✅ Transaction record (DONATION type)
   - ✅ Fee transaction record (FEE type)
   - ✅ Notification to request owner
5. User redirected to dashboard with success message
6. Admin can see transaction in `/admin/accounts`

## 💰 Fee Structure

**Platform Fee Calculation:**
- Base fee: R2.00 (ZAR 2)
- Percentage: 3% of donation amount
- Example: $100 donation = $2 + $3 = $5 fee → $95 net to recipient

## 📊 Admin Accounts Dashboard

View all transactions at `/admin/accounts`:
- See PayPal payment IDs
- Track fees collected
- View gross, fee, and net amounts
- Filter by status, type, date
- Export to CSV

## 🔄 Currency Note

Currently set to **USD** but can be changed to **ZAR** by:
1. Update `src/app/api/paypal/create-order/route.ts` (line 18)
2. Update `src/components/DonationForm.tsx` (line 9)
3. Change `currency: 'USD'` to `currency: 'ZAR'`

## 🚨 Important Notes

1. **Sandbox Mode**: Currently in sandbox mode for testing
2. **Production**: Change `PAYPAL_MODE=production` when ready to go live
3. **PayPal Account**: Make sure your PayPal business account is verified
4. **Fees**: Adjust fee structure in `/api/paypal/capture-order/route.ts` (line 44)

## 📧 Test PayPal Accounts

Create sandbox accounts at: https://developer.paypal.com/dashboard/accounts

You need:
- **Business Account** (for receiving payments) ← Use your credentials above
- **Personal Account** (for testing donations as a buyer)

## 🎯 Next Steps

1. ✅ Code deployed
2. ⏳ Add environment variables to Vercel (DO THIS NOW)
3. ⏳ Redeploy on Vercel
4. ⏳ Test with sandbox account
5. ⏳ Verify transactions appear in admin dashboard
6. ⏳ When ready: Switch to production mode
7. ⏳ Test with real small amount ($1)
8. ⏳ Go live! 🚀
