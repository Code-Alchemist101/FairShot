# Billing UI - Complete Testing Guide

**Date**: December 4, 2025

---

## 🧪 Testing Checklist

### **Pre-requisites**
- ✅ Logged in as a company user
- ✅ Backend running (`npm run start:dev`)
- ✅ Frontend running (`npm run dev`)
- ✅ Stripe secret key configured in `.env`

---

## 📋 Test 1: Billing Page Navigation

### **Step 1: Access Billing Page**

**Action:**
```
Navigate to: http://localhost:3000/company/billing
```

**Expected Result:**
- ✅ Page loads without errors
- ✅ Header shows "Billing & Credits"
- ✅ Balance card displays your current credits
- ✅ Two pricing cards visible (STARTER & PRO)
- ✅ PRO card has "Most Popular" badge
- ✅ Transaction history placeholder at bottom

**Visual Verification:**
- Balance number is large (6xl font) with cyan/blue gradient
- Cards have glassmorphic effect (semi-transparent with blur)
- Hover over cards → they scale up slightly
- PRO card has cyan border glow

---

## 📋 Test 2: Purchase Flow (STARTER Package)

### **Step 1: Initiate Purchase**

**Action:**
1. Click "Buy Now" on STARTER card ($50)

**Expected Result:**
- ✅ Button text changes to "Processing..."
- ✅ Button becomes disabled
- ✅ Redirects to Stripe checkout page

### **Step 2: Complete Payment**

**Action:**
1. On Stripe checkout, enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
2. Click "Pay"

**Expected Result:**
- ✅ Payment processes successfully
- ✅ Redirects to: `http://localhost:3000/company/billing/success`

---

## 📋 Test 3: Success Page

### **Step 1: Verify Success Page**

**URL:** `http://localhost:3000/company/billing/success`

**Expected Elements:**
- ✅ Large green checkmark icon (CheckCircle)
- ✅ Heading: "Payment Successful!"
- ✅ Message: "Your credits have been added to your account."
- ✅ Two buttons visible:
  1. **"Return to Dashboard"** (green gradient)
  2. **"View Billing"** (outlined)

**Visual Verification:**
- Green glow effect around checkmark icon
- Centered layout
- White text on dark background

### **Step 2: Test Navigation - Return to Dashboard**

**Action:**
1. Click "Return to Dashboard" button

**Expected Result:**
- ✅ Navigates to: `http://localhost:3000/company/dashboard`
- ✅ Dashboard page loads

### **Step 3: Test Navigation - View Billing**

**Action:**
1. Go back to success page
2. Click "View Billing" button

**Expected Result:**
- ✅ Navigates to: `http://localhost:3000/company/billing`
- ✅ Billing page loads
- ✅ Balance should reflect new credits (if webhook is configured)

---

## 📋 Test 4: Cancel Flow

### **Step 1: Initiate Purchase**

**Action:**
1. Go to billing page
2. Click "Buy Now" on any package
3. Wait for Stripe checkout to load

### **Step 2: Cancel Payment**

**Action:**
1. On Stripe checkout page, click the back arrow (top-left)
   OR
2. Close the tab/window
   OR
3. Click "Cancel" if available

**Expected Result:**
- ✅ Redirects to: `http://localhost:3000/company/billing/cancel`

---

## 📋 Test 5: Cancel Page

### **Step 1: Verify Cancel Page**

**URL:** `http://localhost:3000/company/billing/cancel`

**Expected Elements:**
- ✅ Large yellow warning icon (AlertTriangle)
- ✅ Heading: "Payment Cancelled"
- ✅ Message: "Your payment was not completed."
- ✅ Two buttons visible:
  1. **"Try Again"** (cyan/blue gradient) ← PRIMARY BUTTON
  2. **"Return to Dashboard"** (outlined)

**Visual Verification:**
- Yellow glow effect around warning icon
- Centered layout
- "Try Again" button has gradient (cyan to blue)
- "Try Again" button is prominent (not outlined)

### **Step 2: Test Navigation - Try Again**

**Action:**
1. Click "Try Again" button

**Expected Result:**
- ✅ Navigates to: `http://localhost:3000/company/billing`
- ✅ Billing page loads
- ✅ Can attempt purchase again

### **Step 3: Test Navigation - Return to Dashboard**

**Action:**
1. Go back to cancel page
2. Click "Return to Dashboard" button

**Expected Result:**
- ✅ Navigates to: `http://localhost:3000/company/dashboard`
- ✅ Dashboard page loads

---

## 📋 Test 6: PRO Package Purchase

### **Action:**
1. Go to billing page
2. Click "Buy Now" on PRO card ($200)
3. Complete payment with test card
4. Verify success page

**Expected Result:**
- ✅ Same flow as STARTER
- ✅ Stripe shows $200 amount
- ✅ Success page displays correctly

---

## 📋 Test 7: Balance Display

### **Step 1: Check Initial Balance**

**Action:**
1. Note the current balance on billing page

**Expected Result:**
- ✅ Number displays correctly
- ✅ Large, prominent display
- ✅ Gradient text effect

### **Step 2: Verify Balance After Purchase**

**Note:** This only works if webhooks are configured

**Action:**
1. Complete a purchase
2. Return to billing page
3. Check balance

**Expected Result:**
- ✅ Balance increases by purchased credits
- OR (if no webhook):
- ⚠️ Balance stays same (manual update needed)

---

## 🎨 Visual Verification Checklist

### **Billing Page**
- [ ] Balance card has gradient background
- [ ] Credit number is large and cyan/blue gradient
- [ ] STARTER card has dark background
- [ ] PRO card has cyan border glow
- [ ] PRO card has "Most Popular" badge at top
- [ ] Cards scale on hover
- [ ] "Buy Now" buttons are visible
- [ ] Transaction history placeholder visible

### **Success Page**
- [ ] Green checkmark icon visible
- [ ] Green glow effect around icon
- [ ] "Return to Dashboard" button is green gradient
- [ ] "View Billing" button is outlined
- [ ] Text is white and readable

### **Cancel Page**
- [ ] Yellow warning icon visible
- [ ] Yellow glow effect around icon
- [ ] "Try Again" button is cyan/blue gradient ← IMPORTANT
- [ ] "Try Again" button is NOT outlined
- [ ] "Return to Dashboard" button is outlined
- [ ] Text is white and readable

---

## 🐛 Troubleshooting

### **Issue: "Try Again" Button Not Visible**

**Possible Causes:**
1. Dark text on dark background
2. Button not rendering
3. CSS not loading

**Debug Steps:**
1. Open browser DevTools (F12)
2. Inspect the button element
3. Check computed styles
4. Verify button has gradient classes

**Expected Button Classes:**
```
className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-6 text-base font-semibold"
```

**Quick Fix:**
- The button should have a cyan-to-blue gradient background
- If it's not visible, check if Tailwind CSS is loaded
- Try hard refresh: `Ctrl+Shift+R`

---

### **Issue: Page Not Loading**

**Check:**
1. Frontend server running: `npm run dev`
2. No console errors in browser DevTools
3. Correct URL: `http://localhost:3000/company/billing`

---

### **Issue: API Errors**

**Check:**
1. Backend server running: `npm run start:dev`
2. Logged in as company user
3. Valid JWT token in localStorage
4. Check browser console for error messages

---

## 📊 Complete Navigation Map

```
Billing Page (/company/billing)
    ↓ Click "Buy Now"
    ↓
Stripe Checkout
    ↓ Complete Payment
    ↓
Success Page (/company/billing/success)
    ↓ Click "Return to Dashboard"
    ↓
Dashboard (/company/dashboard)

---

Billing Page (/company/billing)
    ↓ Click "Buy Now"
    ↓
Stripe Checkout
    ↓ Cancel/Back
    ↓
Cancel Page (/company/billing/cancel)
    ↓ Click "Try Again"
    ↓
Billing Page (/company/billing)

---

Cancel Page (/company/billing/cancel)
    ↓ Click "Return to Dashboard"
    ↓
Dashboard (/company/dashboard)

---

Success Page (/company/billing/success)
    ↓ Click "View Billing"
    ↓
Billing Page (/company/billing)
```

---

## ✅ Final Checklist

### **Functionality**
- [ ] Billing page loads
- [ ] Balance displays correctly
- [ ] Both pricing cards visible
- [ ] "Buy Now" creates checkout session
- [ ] Redirects to Stripe
- [ ] Payment completion → Success page
- [ ] Payment cancellation → Cancel page

### **Navigation**
- [ ] Success → Dashboard works
- [ ] Success → Billing works
- [ ] Cancel → Try Again works
- [ ] Cancel → Dashboard works

### **Visual**
- [ ] All gradients render
- [ ] Icons display correctly
- [ ] Buttons are visible and styled
- [ ] Hover effects work
- [ ] Text is readable

---

## 🎯 Quick Test Script

**5-Minute Test:**

1. ✅ Go to `/company/billing`
2. ✅ Verify balance and cards visible
3. ✅ Click "Buy Now" on STARTER
4. ✅ Cancel on Stripe → Verify cancel page
5. ✅ Click "Try Again" → Back to billing
6. ✅ Click "Buy Now" on PRO
7. ✅ Complete payment → Verify success page
8. ✅ Click "Return to Dashboard" → Verify dashboard

**All working?** ✅ Billing UI is complete!

---

## 📸 Screenshot Checklist

If documenting, capture:
1. Billing page with balance and pricing cards
2. Stripe checkout page
3. Success page
4. Cancel page
5. Navigation flow

---

**Testing Complete!** 🎉

If all tests pass, the Billing UI is production-ready!
