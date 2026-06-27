import type { CountryId, CountryOverride } from "@countryTypes";

function country(config: CountryOverride): CountryOverride {
  return config;
}

export const countryConfig: Record<CountryId, CountryOverride> = {
  // Bosnia and Herzegovina
  BIH: country({
    aliases: ["BiH"],
  }),
  // Turkey
  TUR: country({
    displayName: "Türkiye",
    aliases: ["Turkey"],
  }),
  // Russia
  RUS: country({
    aliases: ["Russia"],
  }),
  // United States
  USA: country({
    aliases: ["USA", "America"],
    focusPoint: [-98.5795, 39.8283],
    simplificationTolerance: 0.00003,
  }),
  // MALI
  MLI: country({
    simplificationTolerance: 0.00003,
  }),
  // MALI
  LBY: country({
    simplificationTolerance: 0.00003,
  }),
  // United Arab Emirates
  ARE: country({
    aliases: ["UAE"],
  }),
  // Czechia
  CZE: country({
    aliases: ["Czechia"],
  }),
  // Saint Vincent and the Grenadines
  VCT: country({
    aliases: ["Saint Vincent and Grenadines"],
  }),
  // Republic of Cabo Verde
  CPV: country({
    aliases: ["Cabo Verde", "Cape Verde"],
  }),
  // Brunei Darussalam
  BRN: country({
    aliases: ["Brunei"],
  }),
  // The Gambia
  GMB: country({
    aliases: ["Gambia"],
  }),
  // Eswatini
  SWZ: country({
    displayName: "Eswatini",
    aliases: ["Swaziland"],
  }),
  // North Macedonia
  MKD: country({
    displayName: "North Macedonia",
    aliases: ["Macedonia"],
  }),
  // South Korea
  KOR: country({
    aliases: ["South Korea"],
  }),
  // North Korea
  PRK: country({
    displayName: "Democratic Republic of Korea",
    aliases: ["North Korea"],
  }),
  // United Kingdom
  GBR: country({
    aliases: ["UK"],
  }),
  //  Côte d'Ivoire
  CIV: country({
    aliases: ["Ivory Coast"],
  }),
  // Republic of the Congo
  COG: country({
    aliases: ["Republic of Congo"],
  }),
  // Democratic Republic of the Congo
  COD: country({
    aliases: ["Democratic Republic of Congo", "DR Congo", "DRC"],
  }),
  // Central African Republic
  CAF: country({
    aliases: ["CAR"],
  }),
  // The Federated States of Micronesia
  FSM: country({
    aliases: ["Micronesia"],
  }),
  // Lao PDR
  LAO: country({
    displayName: "Laos",
    aliases: ["Laos"],
  }),
  // Kiribati
  KIR: country({
    focusPoint: [173, 1.5],
  }),
  // Montserrat
  MSR: country({
    exclude: true,
  }),

  // Antarctica
  ATA: country({
    exclude: true,
  }),
  // Greenland
  GRL: country({
    exclude: true,
  }),
  // Anguilla
  AIA: country({
    exclude: true,
  }),
  // Falkland Islands
  FLK: country({
    exclude: true,
  }),
  // Macao
  MAC: country({
    exclude: true,
  }),
  // Saint Barthélemy
  BLM: country({
    exclude: true,
  }),
  // French Polynesia
  PYF: country({
    exclude: true,
  }),

  // Pitcairn Islands
  PCN: country({
    exclude: true,
  }),
  // Norfolk Island
  NFK: country({
    exclude: true,
  }),
  // Sint Maarten
  SXM: country({
    exclude: true,
  }),
  // Guernsey
  GGY: country({
    exclude: true,
  }),
  // Saint-Martin
  MAF: country({
    exclude: true,
  }),
  // Cook Islands
  COK: country({
    exclude: true,
  }),
  // Bermuda
  BMU: country({
    exclude: true,
  }),
  // British Virgin Islands
  VGB: country({
    exclude: true,
  }),
  // Wallis and Futuna Islands
  WLF: country({
    exclude: true,
  }),
  // British Indian Ocean Territory
  IOT: country({
    exclude: true,
  }),
  // American Samoa
  ASM: country({
    exclude: true,
  }),
  // Jersey
  JEY: country({
    exclude: true,
  }),
  // Aruba
  ABW: country({
    exclude: true,
  }),
  // Saint Helena
  SHN: country({
    exclude: true,
  }),
  // Niue
  NIU: country({
    exclude: true,
  }),
  // Saint Pierre and Miquelon
  SPM: country({
    exclude: true,
  }),
  // Cayman Islands
  CYM: country({
    exclude: true,
  }),
  // United States Virgin Islands
  VIR: country({
    exclude: true,
  }),
  // Turks and Caicos Islands
  TCA: country({
    exclude: true,
  }),
  // Northern Mariana Islands
  MNP: country({
    exclude: true,
  }),
  // Heard I. and McDonald Islands
  HMD: country({
    exclude: true,
  }),
  // Curaçao
  CUW: country({
    exclude: true,
  }),
  // Guam
  GUM: country({
    exclude: true,
  }),
  // Isle of Man
  IMN: country({
    exclude: true,
  }),
  // Åland Islands
  ALA: country({
    exclude: true,
  }),
  // Faeroe Islands
  FRO: country({
    exclude: true,
  }),
  // Hong Kong
  HKG: country({
    exclude: true,
  }),
  // South Georgia and the Islands
  SGS: country({
    exclude: true,
  }),
  // French Southern and Antarctic Lands
  ATF: country({
    exclude: true,
  }),
  // Puerto Rico
  PRI: country({
    exclude: true,
  }),
  // New Caledonia
  NCL: country({
    exclude: true,
  }),
  // Western Sahara
  ESH: country({
    exclude: true,
  }),
};
