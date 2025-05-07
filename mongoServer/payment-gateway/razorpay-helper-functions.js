const axios = require("axios");
const Razorpay = require("razorpay");
require("dotenv").config();
const Hospitals = require('../models/hospitals');
const { getInstituteAndStudentDetails, sendPaymentEmail } = require("./razorpay-utils");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

//CREATE LINKED ACCOUNT IN RAZORPAY (ROUTE)
const CreateRazorpayLinkedAccount = async (
  userID,
  email,
  contactName,
  phoneNumber,
  hospitalDetails,
  transaction
) => {
  let accountId;
  let StakeholderID;
  let rzpProductID;

  try {
    if (!userID || !email || !hospitalDetails) {
      throw new Error("Missing required fields for account creation");
    }

    const sanitizedEmail = email.trim();
    const phone = phoneNumber ? phoneNumber.replace(/\D/g, "") : "";

    const data = {
      email: sanitizedEmail,
      phone,
      type: "route",
      reference_id: `HPT23-${userID}`,
      legal_business_name: hospitalDetails?.hospital_name?.trim() || "",
      business_type: hospitalDetails?.business_type?.trim() || "",
      contact_name: contactName?.trim() || "",
      profile: {
        category: hospitalDetails?.category?.trim() || "",
        subcategory: hospitalDetails?.sub_category?.trim() || "",
        addresses: {
          registered: {
            street1: hospitalDetails?.street?.trim() || "",
            street2: hospitalDetails?.street?.trim() || "",
            city: hospitalDetails?.city?.trim() || "",
            state: hospitalDetails?.state?.trim() || "",
            postal_code: hospitalDetails?.postcode?.trim() || "",
            country: hospitalDetails?.country?.toLowerCase()?.trim() || ""
          }
        }
      },
      notes: {
        app: "WON_PULSE"
      }
    };

    if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
      throw new Error("Missing Razorpay credentials");
    }

    // Create Linked Razorpay Account
    let LinkedAccountData;
    try {
      LinkedAccountData = await axios.post(
        "https://api.razorpay.com/v2/accounts",
        data,
        {
          auth: {
            username: process.env.RAZORPAY_KEY,
            password: process.env.RAZORPAY_SECRET
          },
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      const errMsg = error?.response?.data?.error?.description || error.message;
      console.error("Razorpay account creation failed:", errMsg);
      throw new Error("Razorpay account creation failed: " + errMsg);
    }

    accountId = LinkedAccountData.data.id;

    // Create stakeholder
    let StakeHolderresponse;
    try {
      StakeHolderresponse = await razorpay.stakeholders.create(accountId, {
        name: contactName || "",
        email: sanitizedEmail,
        addresses: {
          residential: {
            street: hospitalDetails.street.trim(),
            city: hospitalDetails.city.trim(),
            state: hospitalDetails.state.trim(),
            postal_code: hospitalDetails.postcode.trim(),
            country: hospitalDetails.country.toLowerCase().trim()
          }
        }
      });
    } catch (error) {
      console.error("Stakeholder creation error:", JSON.stringify(error?.response?.data || error, null, 2));
      throw new Error(
        "Razorpay Stakeholder creation failed: " +
        (error?.response?.data?.error?.description || error.message)
      );
    }

    StakeholderID = StakeHolderresponse.id;

    // Request product configuration
    let rzpProductResponse;
    try {
      rzpProductResponse = await razorpay.products.requestProductConfiguration(
        accountId,
        {
          product_name: "route",
          tnc_accepted: true
        }
      );
    } catch (error) {
      throw new Error(
        "Razorpay Product creation failed: " +
        (error.response?.data || error.message)
      );
    }

    rzpProductID = rzpProductResponse.id;

    // Update the School schema with Razorpay information within the same transaction
    try {
      await Hospitals.updateOne(
        { hospitalId: userID },
        {
          razorpay_linked_account: accountId,
          razorpay_stake_holder: StakeholderID,
          razorpay_product_id: rzpProductID,
          razorpay_account_status: 'not_activated'
        },
        { session: transaction }
      );
    } catch (error) {
      throw new Error("School schema update failed: " + error.message);
    }

    console.log('created the linked account for PULSE')
    return {
      success: true,
      accountId,
      stakeholderId: StakeholderID,
      rzpProductID,
      message: "Razorpay linked account created successfully"
    };
  } catch (err) {
    console.error("CreateRazorpayLinkedAccount failed:", err.message);
    throw new Error(
      err.message || "Creating linked account in Razorpay failed"
    );
  }
};


// UPDATING PRODUCT WITH BANK ACCOUNT DETAILS TO MAKE THE LINKED ACCOUNT ACTIVE
const EditRazorpayProductBankAccountDetails = async (
  rzpAccountID,
  rzpProductID,
  bankDetails
) => {
  console.log(bankDetails, 'from razzzz');
  console.log(rzpAccountID, rzpProductID)
  try {
    const Data = {
      settlements: {
        account_number: bankDetails.account_number,
        ifsc_code: bankDetails.ifsc_code,
        beneficiary_name: bankDetails.account_holder_name
      }
    };

    const ProductUpdate = await razorpay.products.edit(
      rzpAccountID,
      rzpProductID,
      Data
    );

    console.log("Product Update Response:", ProductUpdate);

    // Validate response to confirm success
    if (
      (ProductUpdate &&
        ProductUpdate.active_configuration &&
        ProductUpdate.active_configuration.settlements &&
        ProductUpdate.active_configuration.settlements.account_number ===
        bankDetails.account_number &&
        ProductUpdate.active_configuration.settlements.ifsc_code ===
        bankDetails.ifsc_code &&
        ProductUpdate.activation_status === "activated") ||
      "needs_clarification" // Check if the status is activated
    ) {
      return { success: true, data: ProductUpdate };
    } else {
      console.error(
        'Unexpected response or activation status is not "activated":',
        ProductUpdate
      );
      return {
        success: false,
        message:
          'Unexpected response or activation status is not "activated". Bank details might not be updated.',
        data: ProductUpdate
      };
    }
  } catch (error) {
    console.error(
      "Error updating Razorpay Product",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      message:
        "Failed to update Razorpay product account. Please verify bank details and account ID.",
      error: error.response ? error.response.data : error.message
    };
  }
};

// FUNCTION TO DISABLE PAYMENT LINK THAT IS SENT TO THE CLIENT
const disableRazorpayPaymentLink = async (paymentLinkId) => {
  try {
    const response = await razorpay.paymentLink.cancel(paymentLinkId);
    return response;
  } catch (error) {
    console.error("Error disabling payment link:", error.message);
    throw error;
  }
};

// FUNCTION TO CREATE ORDER IN RAZORPAY TO TRANSFER THE AMOUNT, AFTER PAYMENT IS SUCCESSFUL
const createRzpPaymentOrdertoTransferAmount = async (
  linkedAccountId,
  amount,
  AmountToTransfer,
  currency,
  PurchaseOrderID,
  paymentId
) => {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: currency,
      transfers: [
        {
          account: linkedAccountId,
          amount: AmountToTransfer * 100,
          currency: currency,
          notes: {
            purchaseID: PurchaseOrderID,
            paymentID: paymentId
          },
          on_hold: 0
        }
      ]
    });

    return order;
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw new Error("Failed to create payment link");
  }
};

// CREATE PAYMENT LINK FOR THE STUDENT TO PAY THE INSTITUTE
const createOrderPaymentLinkById = async (details) => {
  try {
    // Validate request body
    if (!details) {
      return { success: false, message: 'Request body is missing.' };
    }

    const {
      service_id,
      user_id: student_id,
      bill_schoolid: institute_id,
      due_amount: amount,
      service_type,
    } = details;

    console.log(student_id, institute_id, amount, service_id, 'details from create order payment link by id')


    if (!service_id || !amount || !student_id || !institute_id) {
      return { success: false, message: 'Missing required fields.' };
    }

    const grossAmount = parseFloat(amount);
    if (isNaN(grossAmount)) {
      return { success: false, message: 'Invalid gross amount.' };
    }

    // Fetch student and institute details
    const studentAndInstituteDetails = await getInstituteAndStudentDetails(
      institute_id,
      student_id
    );
    console.log(studentAndInstituteDetails, 'student and institute details')
    if (!studentAndInstituteDetails) {
      return {
        success: false,
        message: 'Institute or student details not found.',
      };
    }

    const {
      student_email,
      institute_contact,
      razorpay_linked_account,
      student_name,
      student_contact,
      institute_name,
    } = studentAndInstituteDetails;

    const amountInPaise = Math.round(grossAmount * 100);
    const currency = 'INR';

    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency,
      accept_partial: true,
      description: `${service_type} Payment Request – ${institute_name}`,
      customer: {
        name: student_name,
        email: student_email,
        contact: student_contact?.replace(/^91/, '').slice(-10) || '',
      },
      notify: {
        sms: true,
        email: false,
      },
      reminder_enable: true,
      callback_method: 'get',
      notes: {
        institute_id,
        student_id,
        student_name,
        institute_rzp_linked_account_id: razorpay_linked_account,
        gross_amount: amountInPaise,
        currency,
        service_id,
        app:'WON_DIGI',
      },
    });
    console.log(paymentLink, 'payment link created')


    // Send payment email
    await sendPaymentEmail(
      studentAndInstituteDetails,
      paymentLink.short_url,
      amountInPaise
    );

    return {
      success: true,
      message: 'Payment link sent successfully',
      paymentLink: paymentLink.short_url,
      mail: student_email,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create payment link',
      details: error.message,
    };
  }
};


module.exports = {
  razorpay,
  CreateRazorpayLinkedAccount,
  EditRazorpayProductBankAccountDetails,
  disableRazorpayPaymentLink,
  createRzpPaymentOrdertoTransferAmount,
  createOrderPaymentLinkById
};
