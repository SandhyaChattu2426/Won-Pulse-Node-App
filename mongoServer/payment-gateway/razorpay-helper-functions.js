const axios = require("axios");
const Razorpay = require("razorpay");
require("dotenv").config();
const Hospitals = require('../models/hospitals');
const { getHospitalAndPatientDetails, sendPaymentEmail } = require("./razorpay-utils");

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
  currency,
  billId,
  paymentId
) => {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: currency,
      transfers: [
        {
          account: linkedAccountId,
          amount: amount * 100,
          currency: currency,
          notes: {
            billID: billId,
            paymentID: paymentId,
            app: 'WON_PULSE'
          },
          on_hold: 0
        }
      ]
    });

    console.log("Order created successfully:", order);
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
      billId: billID,
      patientId: patient_id,
      hospitalId: hospital_id,
      totalPrice: amount,
      billType: bill_type
    } = details;

    // console.log(patient_id, hospital_id, amount, billID, 'details from create order payment link by id')


    if (!patient_id || !amount || !hospital_id || !billID) {
      return { success: false, message: 'Missing required fields.' };
    }

    const grossAmount = parseFloat(amount);
    if (isNaN(grossAmount)) {
      return { success: false, message: 'Invalid gross amount.' };
    }

    // Fetch student and institute details
    const patientAndHospitalDetails = await getHospitalAndPatientDetails(
      hospital_id,
      patient_id
    );
    // console.log(patientAndHospitalDetails, 'patient and hospital details')
    if (!patientAndHospitalDetails) {
      return {
        success: false,
        message: 'hospital or patient details not found.',
      };
    }

    const {
      email,
      contactInformation,//hospital_contact
      razorpay_linked_account,
      fullName: patient_name,
      contactNumber,//patient_contact
      hospitalId,
      hospitalDetails,
    } = patientAndHospitalDetails;

    console.log(
      email,
      contactInformation.phNo,
      razorpay_linked_account,
      patient_name,
      contactNumber,
      hospitalId,
      hospitalDetails,
      "here"
    );


    const hospital_name = hospitalDetails?.hospitalName;

    const amountInPaise = Math.round(grossAmount * 100);
    const currency = 'INR';

    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency,
      accept_partial: true,
      description: `Bill Payment Request – ${hospital_name}`,
      customer: {
        name: patient_name,
        email: email,
        contact: contactNumber?.replace(/^91/, '').slice(-10) || '',
      },
      notify: {
        sms: true,
        email: false,
      },
      reminder_enable: true,
      callback_method: 'get',
      notes: {
        hospital_id,
        patient_id,
        patient_name,
        hospital_rzp_linked_account_id: razorpay_linked_account,
        total_amount: amountInPaise,
        bill_id: billID,
        currency,
        bill_type: bill_type,
        app: 'WON_PULSE',
      },
    });
    console.log(paymentLink, 'payment link created')


    // Send payment email
    await sendPaymentEmail(
      patientAndHospitalDetails,
      paymentLink.short_url,
      amountInPaise
    );

    return {
      success: true,
      message: 'Payment link sent successfully',
      paymentLink: paymentLink.short_url,
      mail: email,
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
