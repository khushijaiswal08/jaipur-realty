import { describe, expect, it } from "vitest";
import {
  WHATSAPP_MESSAGE_MAX,
  buildWhatsAppUrl,
  generalMessage,
  ownerListingMessage,
  propertyMessage,
  shortlistMessage,
} from "./whatsapp";

describe("WhatsApp link builder (SPEC §24.2)", () => {
  it("builds wa.me links with encoded prefilled text", () => {
    expect(buildWhatsAppUrl("+91 98290 12345")).toBe("https://wa.me/919829012345");
    expect(buildWhatsAppUrl("9829012345", "Hi there & welcome")).toBe(
      "https://wa.me/919829012345?text=Hi%20there%20%26%20welcome",
    );
    expect(buildWhatsAppUrl("123", "x")).toBeNull();
  });

  it("builds the property message with ref code and URL", () => {
    const msg = propertyMessage({
      title: "3 BHK Apartment in Vaishali Nagar",
      refCode: "JP1001",
      priceLabel: "₹85 Lakh",
      url: "https://example.com/property/3-bhk-jp1001",
    });
    expect(msg).toBe(
      "Hi, I'm interested in this property:\n3 BHK Apartment in Vaishali Nagar\nRef: JP1001\nPrice: ₹85 Lakh\nhttps://example.com/property/3-bhk-jp1001\n\nPlease share more details.",
    );
  });

  it("truncates the title (not the ref or URL) when the message is too long", () => {
    const msg = propertyMessage({
      title: "Luxury ".repeat(300),
      refCode: "JP1001",
      priceLabel: "₹1 Cr",
      url: "https://example.com/p",
    });
    expect(msg.length).toBeLessThanOrEqual(WHATSAPP_MESSAGE_MAX);
    expect(msg).toContain("Ref: JP1001");
    expect(msg).toContain("https://example.com/p");
  });

  it("builds other templates", () => {
    expect(generalMessage("Demo Realty")).toBe("Hi Demo Realty, I'm looking for a property in Jaipur. Please share details.");
    expect(ownerListingMessage({ transactionType: "RENT", localityName: "Mansarovar" })).toBe(
      "Hi, I want to list my property for rent in Mansarovar.",
    );
    expect(shortlistMessage([{ refCode: "JP1001", url: "u1" }, { refCode: "JP1002", url: "u2" }])).toBe(
      "Hi, I'm interested in these properties:\nJP1001 – u1\nJP1002 – u2",
    );
  });
});
