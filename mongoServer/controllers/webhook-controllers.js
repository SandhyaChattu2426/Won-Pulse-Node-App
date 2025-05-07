const { createRzpPaymentOrdertoTransferAmount } = require('../payment-gateway/razorpay-helper-functions');
const Hospitals = require('../models/hospitals');


const rzrpayPaymentSuccessWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RZP_DIGI_PAYMENT_WEBHOOK_SECRET;
    const payload = req.body;
    const signature = req.headers["x-razorpay-signature"];

    // Validate the webhook signature
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    // Check if payment was successful
    if (payload.event === "payment.captured") {
      const payment = payload?.payload?.payment?.entity;
      if (!payment) {
        return res.status(400).send("Invalid payload format");
      }

      const appType = payment.notes?.app;
      if (appType !== "WON_DIGI") {
        return res.status(200).send("Payment not related to WON_DIGI, ignoring.");
      }

      const paymentId = payment.id;
      const clientName = payment.notes?.client_name;
      const linkedAccountId = payment.notes?.vendor_rzp_linked_account_id;
      const amount = payment.notes?.total_amount / 100;
      const currency = payment.notes?.currency;
      const Fees = payment.notes?.totalFee;
      const AmountToTransfer = amount - Fees;
      const PurchaseOrderID = payment.notes?.purchase_order_id;
      const VendorId = payment.notes?.vendor_id;
      const invoice_id = payment.notes?.invoice_id;

      const Order = await createRzpPaymentOrdertoTransferAmount(
        linkedAccountId,
        amount,
        AmountToTransfer,
        currency,
        PurchaseOrderID,
        paymentId
      )
        .then(() => {
          updatePayments(PurchaseOrderID, paymentId);
          updateAlerts(PurchaseOrderID, clientName, amount, VendorId);
          updateClient(PurchaseOrderID, amount, VendorId, Order.id);
          markInvoiceInactive(invoice_id);
        })
        .catch((error) => {
          console.error("Error during transfer:", error.message);
        });
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};


const BankAccountStatusUpdateWebhook = async (req, res, next) => {
  const rawBody = req.body;
  const signature = req.headers["x-razorpay-signature"];
  const webhookSecret = process.env.RZP_DIGI_BANK_ACC_UPDATE_SECRET;

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  const payload = JSON.parse(rawBody);

  // ✅ Extract linked account ID and app name from payload
  const linkedAccountId = payload.payload?.product?.entity?.account_id;
  const appNote = payload.payload?.product?.entity?.notes?.app;

  if (!linkedAccountId) {
    return res.status(400).send("Missing linked account id");
  }

  // ✅ Only continue if app is "WON_PULSE"
  if (appNote !== "WON_PULSE") {
    console.warn("Webhook ignored: not related to WON_PULSE app");
    return res.status(200).send("Ignored: Unrelated app");
  }

  try {
    const Hospitals = await Hospitals.findOne({ razorpay_linked_account: linkedAccountId });

    if (!Hospitals) {
      return res.status(404).send("Hospitals not found");
    }

    let status = "";
    switch (payload.event) {
      case "product.route.activated":
        status = "activated";
        break;
      case "product.route.rejected":
        status = "rejected";
        break;
      case "product.route.under_review":
        status = "under_review";
        break;
      case "product.route.needs_clarification":
        status = "needs_clarification";
        break;
      default:
        console.log("Unhandled event type:", payload.event);
        return res.status(200).send("Unhandled event");
    }

    Hospitals.razorpay_account_status = status;
    await Hospitals.save();

    await updateAlertsOnKyCResponse(payload);

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Server error");
  }
};



module.exports = {
  rzrpayPaymentSuccessWebhook,
  BankAccountStatusUpdateWebhook
}