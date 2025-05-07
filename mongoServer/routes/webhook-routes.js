const express = require("express");

const router = express.Router();

const webhookController = require("../controllers/webhook-controllers");


router.post("/rzp-digi-webhook/payment-success",webhookController.rzrpayPaymentSuccessWebhook);

router.post("/rzp-digi-webhook/bank-account-status",webhookController.BankAccountStatusUpdateWebhook);


module.exports = router;