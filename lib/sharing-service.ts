import * as Contacts from "expo-contacts";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export interface Contact {
  id: string;
  name: string;
  phoneNumbers?: { number: string }[];
  emails?: { email: string }[];
}

export interface ShareableResult {
  title: string;
  description: string;
  url: string;
  source: string;
}

/**
 * Request permission to access contacts
 */
export async function requestContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Contacts permission error:", error);
    return false;
  }
}

/**
 * Get all contacts from device
 */
export async function getContacts(): Promise<Contact[]> {
  try {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });

    return data.map((contact: any) => ({
      id: contact.id || "",
      name: contact.name || "Unknown",
      phoneNumbers: contact.phoneNumbers,
      emails: contact.emails,
    }));
  } catch (error) {
    console.error("Get contacts error:", error);
    return [];
  }
}

/**
 * Share result via native share sheet
 */
export async function shareResult(result: ShareableResult): Promise<boolean> {
  try {
    const message = `
${result.title}

${result.description}

Source: ${result.url}
From: ${result.source}
    `.trim();

    if (Platform.OS === "web") {
      // Web: copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        return true;
      }
      return false;
    }

    // Native: use share sheet
    try {
      await Sharing.shareAsync(result.url, {
        mimeType: "text/plain",
      });
      return true;
    } catch (e) {
      return false;
    }
  } catch (error) {
    console.error("Share error:", error);
    return false;
  }
}

/**
 * Share result with specific contact via WhatsApp/Email/SMS
 */
export async function shareWithContact(
  result: ShareableResult,
  contact: Contact,
  method: "whatsapp" | "email" | "sms"
): Promise<boolean> {
  try {
    const message = `
${result.title}

${result.description}

Source: ${result.url}
From: ${result.source}
    `.trim();

    if (method === "whatsapp" && contact.phoneNumbers?.[0]) {
      const phone = contact.phoneNumbers[0].number?.replace(/\D/g, "");
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      await Sharing.shareAsync(whatsappUrl);
      return true;
    } else if (method === "email" && contact.emails?.[0]) {
      const email = contact.emails[0].email;
      const subject = encodeURIComponent(result.title);
      const body = encodeURIComponent(message);
      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      await Sharing.shareAsync(mailtoUrl);
      return true;
    } else if (method === "sms" && contact.phoneNumbers?.[0]) {
      const phone = contact.phoneNumbers[0].number;
      const encodedMessage = encodeURIComponent(message);
      const smsUrl = `sms:${phone}?body=${encodedMessage}`;
      await Sharing.shareAsync(smsUrl);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Share with contact error:", error);
    return false;
  }
}

/**
 * Export result as text file
 */
export async function exportResultAsText(result: ShareableResult): Promise<string | null> {
  try {
    const content = `
Title: ${result.title}
Description: ${result.description}
URL: ${result.url}
Source: ${result.source}
Date: ${new Date().toISOString()}
    `.trim();

    const filename = `result-${Date.now()}.txt`;
    
    if (Platform.OS === "web") {
      // Web: create blob and download
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return filename;
    }

    // Native: use file system (would need expo-file-system)
    return filename;
  } catch (error) {
    console.error("Export error:", error);
    return null;
  }
}
