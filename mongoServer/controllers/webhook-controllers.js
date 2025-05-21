const { createRzpPaymentOrdertoTransferAmount } = require('../payment-gateway/razorpay-helper-functions');
const Hospitals = require('../models/hospitals');
const updateAppointment=require('../controllers/appointment-controllers')
const updateBillStatus=require('../controllers/billControlleres')

const rzrpayPaymentSuccessWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RZP_PULSE_PAYMENT_WEBHOOK_SECRET;
    const payload = req.body;
    const signature = req.headers["x-razorpay-signature"];

    console.log("Webhook payload:", payload);

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
      if (appType !== "WON_PULSE") {
        return res.status(200).send("Payment not related to WON_PULSE, ignoring.");
      }

      const paymentId = payment?.id;
      const patient_name = payment.notes?.patient_name;
      const linkedAccountId = payment.notes?.hospital_rzp_linked_account_id;
      const amount = payment.notes?.total_amount / 100;
      // const AmountToTransfer = amount - Fees;
      const HospitalId = payment.notes?.hospital_id;
      const billId = payment.notes?.bill_id;
      const patientId = payment.notes?.patient_id;
      const currency = payment?.notes?.currency;

      console.log("Payment details:", {
        paymentId,
        patient_name,
        linkedAccountId, 
        amount,
        HospitalId,
        billId,
        patientId
      });
      let Order;
      try{
        Order = await createRzpPaymentOrdertoTransferAmount(
          linkedAccountId,
          amount,
          currency,
          billId,
          paymentId
        );

        if(payment?.notes?.bill_type === "Pharma"){
          console.log("pharma", billId);
          console.log("teigger")
           // updatePayments(PurchaseOrderID, paymentId);
          // updateAlerts(PurchaseOrderID, clientName, amount, VendorId); // pass bill ID based on that take appointmentIds and reports complete them all.....
          // updateClient(PurchaseOrderID, amount, VendorId, Order.id);
          // markInvoiceInactive(invoice_id);
        }else if(payment?.notes?.bill_type === "GeneralBill"){
          console.log("general", billId);
          await updateBillStatus.updateBillStatus(billId, HospitalId)
          // updatePayments(PurchaseOrderID, paymentId);
          // updateAlerts(PurchaseOrderID, clientName, amount, VendorId);
          // updateClient(PurchaseOrderID, amount, VendorId, Order.id);
          // markInvoiceInactive(invoice_id);
        }

        console.log("Payment transfer successful:", Order);
      }catch(err){
        console.error("Error during transfer:", err.message);
      }

      // const Order = await createRzpPaymentOrdertoTransferAmount(
      //   linkedAccountId,
      //   amount,
      //   currency,
      //   billId,
      //   paymentId
      // )
      //   .then(() => {
      //     // updatePayments(PurchaseOrderID, paymentId);
      //     // updateAlerts(PurchaseOrderID, clientName, amount, VendorId);
      //     // updateClient(PurchaseOrderID, amount, VendorId, Order.id);
      //     // markInvoiceInactive(invoice_id);

      //     console.log("Payment transfer successful:", Order);
      //   })
      //   .catch((error) => {
      //     console.error("Error during transfer:", error.message);
      //   });


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
  const webhookSecret = process.env.RZP_PULSE_BANK_ACC_UPDATE_SECRET;

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

    // await updateAlertsOnKyCResponse(payload);

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