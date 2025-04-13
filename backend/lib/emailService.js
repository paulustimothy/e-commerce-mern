import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export const sendOrderConfirmationEmail = async (order, userEmail) => {
  try {
    // First, populate the products information
    const populatedOrder = await order.populate('products.product');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669; text-align: center;">Thank You for Your Order!</h1>
        <p>Your order #${order._id} has been confirmed.</p>
        
        <div style="background-color: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0; color: #fff;">
          <h2 style="color: #10b981; margin-bottom: 10px;">Order Details</h2>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          
          <h3 style="color: #10b981; margin-top: 20px;">Items Ordered:</h3>
          <ul style="list-style: none; padding: 0;">
            ${populatedOrder.products.map(item => `
              <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #374151;">
                <div>${item.product.name}</div>
                <div>Quantity: ${item.quantity}</div>
                <div>Price: $${item.price.toFixed(2)}</div>
                <div>Subtotal: $${(item.price * item.quantity).toFixed(2)}</div>
              </li>
            `).join('')}
          </ul>
          
          <p style="font-size: 18px; margin-top: 20px; color: #10b981;">
            <strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}
          </p>
        </div>
        
        <p>Your order will be delivered within 3-5 business days.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">If you have any questions, please contact our support team.</p>
          <p style="color: #10b981;">Thank you for shopping with us!</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"My E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation #${order._id}`,
      html: emailHtml
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&userId=${user._id}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #059669; text-align: center;">Verify Your Email</h1>
      <p>Thank you for signing up! Please verify your email by clicking the link below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" 
           style="background-color: #059669; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${verificationLink}</p>
      
      <p style="color: #6b7280; margin-top: 30px;">This link will expire in 24 hours.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"My E-Commerce Store" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify Your Email Address",
    html: emailHtml
  });

  return true;
};