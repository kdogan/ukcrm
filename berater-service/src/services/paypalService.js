const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// PayPal Environment Configuration
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  return mode === 'live'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

// Returns PayPal HTTP client instance
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

/**
 * Create PayPal Order
 * @param {Object} orderData - Order details
 * @param {string} orderData.packageName - Package name
 * @param {string} orderData.billingInterval - monthly or yearly
 * @param {number} orderData.amount - Total amount
 * @param {string} orderData.currency - Currency code (EUR, USD, etc.)
 * @param {string} orderData.userId - User ID
 */
async function createOrder(orderData) {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderData.userId,
      description: `${orderData.packageDisplayName || orderData.packageName} - ${orderData.billingInterval === 'yearly' ? 'Jährlich' : 'Monatlich'}`,
      custom_id: JSON.stringify({
        userId: orderData.userId,
        packageName: orderData.packageName,
        billingInterval: orderData.billingInterval
      }),
      amount: {
        currency_code: orderData.currency,
        value: orderData.amount.toFixed(2)
      }
    }],
    application_context: {
      brand_name: 'Berater App',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.CORS_ORIGIN}/payment/success`,
      cancel_url: `${process.env.CORS_ORIGIN}/payment/cancel`
    }
  });

  try {
    const order = await client().execute(request);
    return {
      success: true,
      orderId: order.result.id,
      approvalUrl: order.result.links.find(link => link.rel === 'approve').href,
      order: order.result
    };
  } catch (error) {
    console.error('PayPal Create Order Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Capture PayPal Order
 * @param {string} orderId - PayPal Order ID
 */
async function captureOrder(orderId) {
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);

    // Extract custom data
    const customId = capture.result.purchase_units[0].payments.captures[0].custom_id ||
                    capture.result.purchase_units[0].custom_id;

    let orderData = {};
    if (customId) {
      try {
        orderData = JSON.parse(customId);
      } catch (e) {
        console.error('Error parsing custom_id:', e);
      }
    }

    return {
      success: true,
      capture: capture.result,
      orderData: orderData,
      transactionId: capture.result.purchase_units[0].payments.captures[0].id,
      status: capture.result.status
    };
  } catch (error) {
    console.error('PayPal Capture Order Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Order Details
 * @param {string} orderId - PayPal Order ID
 */
async function getOrderDetails(orderId) {
  const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);

  try {
    const order = await client().execute(request);
    return {
      success: true,
      order: order.result
    };
  } catch (error) {
    console.error('PayPal Get Order Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createOrder,
  captureOrder,
  getOrderDetails
};
