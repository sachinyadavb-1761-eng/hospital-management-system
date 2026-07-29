import Razorpay from "razorpay";
import crypto from "crypto";
import Appointment from "../models/Appointment.js";

let razorpay;
function getRazorpayInstance() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// STEP 1: Order create karo
export const createOrder = async (req, res) => {
  try {
    const { amount, appointmentId } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await getRazorpayInstance().orders.create(options);

    await Appointment.findByIdAndUpdate(appointmentId, {
      orderId: order.id,
      paymentStatus: "pending",
    });

    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// STEP 2: Payment verify karo
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: "confirmed",
        paymentId: razorpay_payment_id,
      });
      return res
        .status(200)
        .json({
          success: true,
          message: "Payment verified, appointment confirmed",
        });
    } else {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: "failed",
      });
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid signature, payment verification failed",
        });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
