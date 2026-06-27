import type { CountriesGeoJson, CountryFeature } from "@countryTypes";

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

export class CountryManager {
  private countries: CountryFeature[];
  private byId = new Map<string, CountryFeature>();
  private byIndex = new Map<number, CountryFeature>();
  private byAlias = new Map<string, CountryFeature>();

  constructor(data: CountriesGeoJson) {
    this.countries = data.features;

    for (const country of this.countries) {
      this.byId.set(country.properties.id, country);
      this.byIndex.set(country.properties.index, country);

      for (const alias of country.properties.aliases) {
        this.byAlias.set(normalizeSearchValue(alias), country);
      }
    }
  }

  getAll(): CountryFeature[] {
    return this.countries;
  }

  getPlayable(): CountryFeature[] {
    return this.countries.filter((country) => country.properties.playable);
  }

  getById(id: string): CountryFeature | undefined {
    return this.byId.get(id);
  }

  getByIndex(index: number): CountryFeature | undefined {
    return this.byIndex.get(index);
  }

  findByAlias(input: string): CountryFeature | undefined {
    return this.byAlias.get(normalizeSearchValue(input));
  }

  getRandomPlayable(): CountryFeature {
    const playable = this.getPlayable();
    return playable[Math.floor(Math.random() * playable.length)];
  }
}
