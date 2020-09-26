changeLoadingState(false);
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe = Stripe('pk_test_51HTTZyFaIcvTY5RCQDeSyFxaUzFclenvOQ9XzdPA9zD0OcG5gdRIDhPxDZXxOeI2dgWbbXLshjCpoypQK4PyRIZK00nWzjQW0U');
var elements = stripe.elements();

// Set up Stripe.js and Elements to use in checkout form
var style = {
  base: {
    color: "#32325d",
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#aab7c4"
    }
  },
  invalid: {
    color: "#fa755a",
    iconColor: "#fa755a"
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");

card.on('change', showCardError);

function changeLoadingState(isLoading) {
  if (isLoading) {
    document.querySelector('#button-pay').disabled = true;
    document.querySelector('#button-text').classList.add('d-none');
    document.querySelector('#loading').classList.remove('d-none');
  } else {
    document.querySelector('#button-pay').disabled = false;
    document.querySelector('#button-text').classList.remove('d-none');
    document.querySelector('#loading').classList.add('d-none');
  }
}

function showCardError(event) {
  let displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
}

function onSubscriptionComplete(subscription, invoice, paymentMethodId) {
  // Payment was successful.
  if (subscription.status === 'active') {
    // Call your backend to grant access to your service based on
    // `result.subscription.items.data[0].price.product` the customer subscribed to.
    // Remove invoice from localstorage because payment is now complete.
    localStorage.clear();
    // Change your UI to show a success message to your customer.
    window.location.href = "/login"
  }
  // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
  // If it's a retry, the payment intent will be on the invoice itself.
  let paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent;
  if (
    paymentIntent.status === 'requires_action' ||
    (isRetry === true && paymentIntent.status === 'requires_payment_method')
  ) {
    return stripe
      .confirmCardPayment(paymentIntent.client_secret, {
        payment_method: paymentMethodId,
      })
      .then((result) => {
        if (result.error) {
          // Start code flow to handle updating the payment details.
          // Display error message in your UI.
          // The card was declined (i.e. insufficient funds, card has expired, etc).
          throw result;
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            // Show a success message to your customer.
            // There's a risk of the customer closing the window before the callback.
            // We recommend setting up webhook endpoints later in this guide.
            // Remove invoice from localstorage because payment is now complete.
            localStorage.clear();
            // Change your UI to show a success message to your customer.
            window.location.href = "/login"
            return {
              priceId: priceId,
              subscription: subscription,
              invoice: invoice,
              paymentMethodId: paymentMethodId,
            };
          }
        }
      })
      .catch((error) => {
        displayError(error);
      });
  } else {
    // No customer action needed.
    return { subscription, priceId, paymentMethodId };
  }
  // Manage subscription payment failure
  if (
    subscription.latest_invoice.payment_intent.status ===
    'requires_payment_method'
  ) {
    console.log('Failure payment');
    // Using localStorage to manage the state of the retry here,
    // feel free to replace with what you prefer.
    // Store the latest invoice ID and status.
    localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
    localStorage.setItem(
      'latestInvoicePaymentIntentStatus',
      subscription.latest_invoice.payment_intent.status
    );
    throw { error: { message: 'Your card was declined.' } };
  }
}

function createSubscription({ customerId, paymentMethodId, invoiceId, priceId }) {
  return (
    fetch('/create-subscription', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: paymentMethodId,
        priceId: priceId,
      }),
    })
      .then((response) => {
        return response.json();
    })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          changeLoadingState(false);
          // The card had an error when trying to attach it to a customer.
          throw result;
        }
        return result;
    })
      // Normalize the result to contain the object returned by Stripe.
      // Add the additional details we need.
      .then((result) => {
        onSubscriptionComplete(result, invoiceId, paymentMethodId);
        return {
          paymentMethodId: paymentMethodId,
          priceId: priceId,
          subscription: result,
        };
    })
      // Some payment methods require a customer to be on session
      // to complete the payment process. Check the status of the
      // payment intent to handle these actions.
      .then(handlePaymentThatRequiresCustomerAction)
      // If attaching this card to a Customer object succeeds,
      // but attempts to charge the customer fail, you
      // get a requires_payment_method error.
      .then(handleRequiresPaymentMethod)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        changeLoadingState(false);
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        showCardError(error);
    })
  );
}

function retryInvoiceWithNewPaymentMethod({
  customerId,
  paymentMethodId,
  invoiceId,
  priceId
}) {
  return (
    fetch('/retry-invoice', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId: customerId,
        paymentMethodId: paymentMethodId,
        invoiceId: invoiceId,
      }),
    })
      .then((response) => {
        return response.json();
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          // The card had an error when trying to attach it to a customer.
          throw result;
        }
        return result;
      })
      // Normalize the result to contain the object returned by Stripe.
      // Add the additional details we need.
      .then((result) => {
        return {
          // Use the Stripe 'object' property on the
          // returned result to understand what object is returned.
          invoice: result,
          paymentMethodId: paymentMethodId,
          priceId: priceId,
          isRetry: true,
        };
      })
      // Some payment methods require a customer to be on session
      // to complete the payment process. Check the status of the
      // payment intent to handle these actions.
      .then(handlePaymentThatRequiresCustomerAction)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        displayError(error);
      })
  );
}

function createPaymentMethod({ card, isPaymentRetry, invoiceId }) {
  // Set up payment method for recurring usage
  let billingName = document.querySelector('#name').value;
  stripe
    .createPaymentMethod({
      type: 'card',
      card: card,
      billing_details: {
        name: billingName,
      },
    })
      .then((result) => {
        $.post('/create-stripeUser', {paymentMethodId: result.paymentMethod.id})
          .done((data) => {
            if (result.error) {
              displayError(result);
            } else {
              if (isPaymentRetry) {
                // Update the payment method and retry invoice payment
                retryInvoiceWithNewPaymentMethod({
                  customerId: customerId,
                  paymentMethodId: result.paymentMethod.id,
                  invoiceId: invoiceId,
                  priceId: priceId,
                });
              } else {
                // Create the subscription
                createSubscription({
                  customerId: customerId,
                  paymentMethodId: result.paymentMethod.id,
                  invoiceId: invoiceId,
                  priceId: priceId,
                });
              }
            }
          })
  });
}

var form = document.getElementById('subscription-form');
form.addEventListener('submit', function (ev) {
  ev.preventDefault();
  changeLoadingState(true);
  // If a previous payment was attempted, get the latest invoice
  const latestInvoicePaymentIntentStatus = localStorage.getItem(
    'latestInvoicePaymentIntentStatus'
  );
  if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
    const invoiceId = localStorage.getItem('latestInvoiceId');
    const isPaymentRetry = true;
    // create new payment method & retry payment on invoice with new payment method
    createPaymentMethod({
      card,
      isPaymentRetry,
      invoiceId });
    } else {
    // create new payment method & create subscription
    createPaymentMethod({ card });
  }
});
