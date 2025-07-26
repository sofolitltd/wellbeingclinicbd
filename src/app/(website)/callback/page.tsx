import CallBackComponent from "./callback-component";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Processing Payment | bKash Callback",
    description: "Processing your bKash payment. Please wait.",
};

const CallBackPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallBackComponent />
        </Suspense>
    );
}
 
export default CallBackPage;
