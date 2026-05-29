/**
 * Pharmacquest — Nigerian schools of pharmacy
 *
 * Source: PCN-accredited universities offering pharmacy programs in Nigeria.
 * 25 institutions as of 2025. Update this list as PCN accredits more.
 */

export interface School {
  /** Short display label used in the dropdown. */
  label: string;
  /** Stable internal value. Used in the database. */
  value: string;
  /** Location for disambiguation. */
  state: string;
}

export const NIGERIAN_PHARMACY_SCHOOLS: School[] = [
  // Federal universities
  { label: "Ahmadu Bello University (ABU), Zaria", value: "abu_zaria", state: "Kaduna" },
  { label: "Bayero University (BUK), Kano", value: "buk_kano", state: "Kano" },
  { label: "Federal University, Ndufu-Alike", value: "funai_ndufu", state: "Ebonyi" },
  { label: "Nnamdi Azikiwe University (UNIZIK), Awka", value: "unizik_awka", state: "Anambra" },
  { label: "Obafemi Awolowo University (OAU), Ile-Ife", value: "oau_ife", state: "Osun" },
  { label: "University of Benin (UNIBEN)", value: "uniben", state: "Edo" },
  { label: "University of Calabar (UNICAL)", value: "unical", state: "Cross River" },
  { label: "University of Ibadan (UI)", value: "ui_ibadan", state: "Oyo" },
  { label: "University of Ilorin (UNILORIN)", value: "unilorin", state: "Kwara" },
  { label: "University of Jos (UNIJOS)", value: "unijos", state: "Plateau" },
  { label: "University of Lagos (UNILAG)", value: "unilag", state: "Lagos" },
  { label: "University of Maiduguri (UNIMAID)", value: "unimaid", state: "Borno" },
  { label: "University of Nigeria, Nsukka (UNN)", value: "unn_nsukka", state: "Enugu" },
  { label: "University of Port Harcourt (UNIPORT)", value: "uniport", state: "Rivers" },
  { label: "University of Uyo (UNIUYO)", value: "uniuyo", state: "Akwa Ibom" },
  { label: "Usmanu Danfodiyo University, Sokoto (UDUS)", value: "udus_sokoto", state: "Sokoto" },

  // State universities
  { label: "Delta State University (DELSU), Abraka", value: "delsu_abraka", state: "Delta" },
  { label: "Enugu State University (ESUT)", value: "esut", state: "Enugu" },
  { label: "Kaduna State University (KASU)", value: "kasu_kaduna", state: "Kaduna" },
  { label: "Niger Delta University (NDU)", value: "ndu_amassoma", state: "Bayelsa" },
  { label: "Olabisi Onabanjo University (OOU), Ago-Iwoye", value: "oou_ago_iwoye", state: "Ogun" },

  // Private universities
  { label: "Babcock University, Ilishan-Remo", value: "babcock", state: "Ogun" },
  { label: "Igbinedion University, Okada", value: "igbinedion_okada", state: "Edo" },
  { label: "Madonna University, Elele", value: "madonna_elele", state: "Rivers" },
  { label: "Niger Delta University, Wilberforce Island", value: "nigerdelta_wilberforce", state: "Bayelsa" },
];

/**
 * Validate a school value against the known list (or "other").
 */
export function isValidSchoolValue(value: string): boolean {
  if (value === "other") return true;
  return NIGERIAN_PHARMACY_SCHOOLS.some((s) => s.value === value);
}