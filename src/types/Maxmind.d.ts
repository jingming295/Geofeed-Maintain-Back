interface GeoLite2CityResult
{
    city?: GeoNameItem;
    continent?: ContinentInfo;
    country?: CountryInfo;
    location?: LocationInfo;
    registered_country?: CountryInfo;
    subdivisions?: SubdivisionInfo[];
}

interface GeoNameItem
{
    geoname_id: number;
    names: Record<string, string>; // en / zh-CN / fr / es ...
}

interface ContinentInfo
{
    code: string;          // "AS"
    geoname_id: number;
    names: Record<string, string>;
}

interface CountryInfo
{
    geoname_id: number;
    iso_code: string;      // "HK"
    names: Record<string, string>;
}

interface SubdivisionInfo
{
    geoname_id: number;
    iso_code: string;      // "NKT"
    names: Record<string, string>;
}

interface LocationInfo
{
    accuracy_radius: number;
    latitude: number;
    longitude: number;
    time_zone: string;
}
