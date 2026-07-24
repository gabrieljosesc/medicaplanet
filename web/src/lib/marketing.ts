/** Google Ads account ID (marketing@medicaplanet.com). */
export const GOOGLE_ADS_ID = "AW-18323938697";

/** Meta (Facebook) Pixel ID. */
export const META_PIXEL_ID = "1298323648776735";

/**
 * `send_to` for the Google Ads "Purchase" conversion action. Fired once on the
 * checkout success page with the order's real value and reference.
 */
export const GOOGLE_ADS_PURCHASE_SEND_TO = `${GOOGLE_ADS_ID}/5jayCJTS0dAcEIm7xKFE`;

/**
 * Currency reported with conversion values. Orders are priced and charged in
 * USD, so conversions must be reported in USD even though the Google Ads
 * account's default currency is COP — otherwise Ads reads a $1,895 order as
 * 1,895 COP (about $0.45) and optimises bidding against the wrong numbers.
 */
export const CONVERSION_CURRENCY = "USD";
