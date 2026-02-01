
/**
 * Service to handle Google Drive Uploads and Email Sending via Google Apps Script
 */

// TODO: REPLACE THIS URL WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
// Example: https://script.google.com/macros/s/AKfycbx.../exec
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

/**
 * Uploads an image to Google Drive and triggers an email to the user.
 * 
 * @param {string} imageBase64 - The base64 string of the image (can include data:image/png;base64, prefix)
 * @param {string} email - The user's email address
 * @returns {Promise<{success: boolean, url: string, message: string}>}
 */
export const uploadAndSendEmail = async (imageBase64, email, isWinner = false) => {
    if (!GOOGLE_SCRIPT_URL) {
        console.error("Google Script URL is not configured.");
        return { success: false, message: "System configuration error: Backend URL missing." };
    }

    try {
        // Remove header if present to get pure base64
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                image: cleanBase64,
                email: email,
                isWinner: isWinner
            })
        });

        // With 'no-cors', we can't read the response. 
        // With 'cors', we can.
        // Let's try to parse text/json.
        const data = await response.json();

        if (data.status === 'success') {
            return { success: true, url: data.url, message: "Email sent successfully!" };
        } else {
            return { success: false, message: data.message || "Unknown error from backend." };
        }

    } catch (error) {
        console.error("Upload failed:", error);
        // Fallback for CORS issues where we can't read response but request might have succeeded
        // return { success: false, message: "Network error or CORS issue. Check console." };
        return { success: false, message: `Failed to connect: ${error.message}` };
    }
};

/**
 * Helper to convert Blob to Base64
 */
export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
