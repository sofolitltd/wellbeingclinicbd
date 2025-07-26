
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast";
import { XCircle } from "lucide-react";

const CallBackComponent = () => {
  const router = useRouter()
  const { toast } = useToast();
  const searchParams = useSearchParams()
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Processing your payment...");
  const [isError, setIsError] = useState(false);

  const handleCallback = useCallback(async () => {
      const status = searchParams.get("status");
      const paymentID = searchParams.get("paymentID");

      const handleFailure = (title: string, description: string) => {
        console.error(`[Callback] Payment Failure/Cancellation. Status: ${status}, PaymentID: ${paymentID}`);
        toast({ variant: "destructive", title, description });
        // Go back two steps in history to skip the bKash error page and return to the appointment form
        window.history.go(-2);
      };

      if (status === "cancel") {
          handleFailure("Payment Canceled", "You have canceled the payment. Please try again.");
          return;
      }

      if (status === "failure") {
          handleFailure("Payment Failed", "The payment failed. Please check your bKKash account and try again.");
          return;
      }
      
      if (status === "success" && paymentID) {
          setStatusMessage("Verifying payment and confirming booking...");
          try {
              const verifyResponse = await fetch("/api/callback", {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentID })
              });

              const verifyData = await verifyResponse.json();

              if (!verifyResponse.ok) {
                  throw new Error(verifyData.statusMessage || "Booking verification failed on the server.");
              }
              
              if (verifyData.success && verifyData.appointmentId) {
                  setStatusMessage("All done! Redirecting to your confirmation...");
                  // Redirect to the new confirmation page with the appointment ID
                  router.push(`/appointment/confirm?id=${verifyData.appointmentId}`);
              } else {
                  throw new Error(verifyData.statusMessage || "Payment verification was unsuccessful.");
              }
          } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
              console.error("[Callback] Error during payment verification:", {
                  paymentID,
                  error,
              });
              toast({ 
                  variant: "destructive", 
                  title: "Booking Confirmation Failed", 
                  description: `${errorMessage} Please contact support if the problem persists.`,
                  duration: 5000,
              });
              setIsError(true);
              setStatusMessage(`Booking failed: ${errorMessage}. Please try again.`);
              setTimeout(() => window.history.go(-2), 3000);
          }
      } else {
          const errorMessage = "Invalid payment callback data received.";
          console.error("[Callback] Invalid callback parameters:", { params: searchParams.toString() });
          toast({ 
              variant: "destructive", 
              title: "Invalid Payment Link", 
              description: "There was a problem with the payment link. Please try booking again.",
              duration: 5000,
          });
          setIsError(true);
          setStatusMessage(errorMessage);
          setTimeout(() => window.history.go(-2), 3000);
      }
  }, [searchParams, router, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (searchParams.toString() && isProcessing) {
            handleCallback();
            setIsProcessing(false); 
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams, handleCallback, isProcessing]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-gray-50 dark:to-gray-900">
      <div className="text-center p-4">
        {isError ? (
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        )}
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{isError ? 'Action Required' : 'Processing...'}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {statusMessage}
        </p>
      </div>
    </div>
  )
}

export default CallBackComponent;
