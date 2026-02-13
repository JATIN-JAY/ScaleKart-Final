import { useState, useCallback } from 'react';
import { paymentsAPI } from '../api/payments';
import toast from 'react-hot-toast';

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const initiatePayment = useCallback(
    async ({ amount, items, shippingAddress, prefill, onSuccess }) => {
      setLoading(true);

      try {
        if (!window.Razorpay) {
          throw new Error('Razorpay SDK not loaded. Refresh page.');
        }

        // 1️⃣ Create Razorpay order
        const res = await paymentsAPI.createOrder({
          amount,
          items,
          shippingAddress,
        });

        // ✅ FIXED destructuring (important)
        const { id: razorpayOrderId, amount: razorpayAmount, currency } = res.data;

        // 2️⃣ Get Razorpay key
        const keyRes = await paymentsAPI.getRazorpayKey();
        const key = keyRes.data.keyId;

        const options = {
          key,
          amount: razorpayAmount, // already in paise
          currency,
          name: 'ScaleKarrt',
          description: 'Secure Order Payment',
          order_id: razorpayOrderId,

          handler: async (response) => {
            await paymentsAPI.verifyPayment(response);
            toast.success('Payment successful 🎉');
            onSuccess?.();
          },

          prefill,
          theme: { color: '#3b82f6' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Razorpay error:', err);
        toast.error(err?.message || 'Payment failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { initiatePayment, loading };
};

// import { useState, useCallback } from 'react';
// import { paymentsAPI } from '../api/payments';
// import toast from 'react-hot-toast';

// export const useRazorpay = () => {
//   const [loading, setLoading] = useState(false);

//   const initiatePayment = useCallback(
//     async ({ items, shippingAddress, prefill, onSuccess }) => {
//       setLoading(true);

//       try {
//         if (!window.Razorpay) {
//           throw new Error('Razorpay SDK not loaded. Refresh page.');
//         }

//         // 1️⃣ Create Razorpay order (backend also creates DB pending order)
//         const res = await paymentsAPI.createOrder({
//           items,
//           shippingAddress,
//         });

//         /**
//          * Axios structure:
//          * res.data → { status, data }
//          * res.data.data → actual payload
//          */
//         const { orderId, razorpayOrderId, amount, currency } = res.data.data;

//         // 2️⃣ Get Razorpay public key
//         const keyRes = await paymentsAPI.getRazorpayKey();
//         const key = keyRes.data.data.keyId;

//         const options = {
//           key,
//           amount, // already in paise from backend
//           currency,
//           name: 'ScaleKarrt',
//           description: 'Secure Order Payment',
//           order_id: razorpayOrderId,

//           // 3️⃣ SUCCESS HANDLER
//           handler: async (response) => {
//             try {
//               await paymentsAPI.verifyPayment({
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//                 orderId, // 🔥 tells backend which DB order to mark paid
//               });

//               toast.success('Payment successful 🎉');
//               onSuccess?.();
//             } catch (err) {
//               console.error('Verify error:', err);
//               toast.error(
//                 err?.response?.data?.message ||
//                   'Payment verified but order update failed'
//               );
//             }
//           },

//           prefill,
//           theme: { color: '#3b82f6' },
//         };

//         const rzp = new window.Razorpay(options);
//         rzp.open();
//       } catch (err) {
//         console.error('Razorpay error:', err);
//         toast.error(err?.response?.data?.message || 'Payment failed');
//         throw err;
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   return { initiatePayment, loading };
// };
