interface CountryData
{
    geonames: {
        continent: string; // 大洲代码（例如 "NA"）
        capital: string; // 首都名称（例如 "Washington"）
        languages: string; // 语言代码，逗号分隔（例如 "en-US,es-US,haw,fr"）
        geonameId: number; // GeoNames 的 ID（例如 6252001）
        south: number; // 南部纬度（例如 24.543938895）
        isoAlpha3: string; // ISO Alpha-3 代码（例如 "USA"）
        north: number; // 北部纬度（例如 49.3844873）
        fipsCode: string; // FIPS 国家代码（例如 "US"）
        population: string; // 人口数量（例如 "327167434"）
        east: number; // 东部经度（例如 -66.949185723）
        isoNumeric: string; // ISO 数字代码（例如 "840"）
        areaInSqKm: string; // 国家面积（单位：平方公里）（例如 "9629091.0"）
        countryCode: string; // ISO Alpha-2 代码（例如 "US"）
        west: number; // 西部经度（例如 -124.732598496）
        countryName: string; // 国家名称（例如 "United States"）
        postalCodeFormat: string; // 邮政编码格式（例如 "#####-####"）
        continentName: string; // 大洲名称（例如 "North America"）
        currencyCode: string;
    }[]

}

interface DivisionData
{
    totalResultsCount: number
    geonames?: {
        adminCode1: string; // 子分区代码 (例如 "07")
        lng: string; // 经度 (例如 "1.49414")
        geonameId: number; // GeoNames ID (例如 3041566)
        toponymName: string; // 地名 (例如 "Andorra la Vella")
        countryId: string; // 国家ID (例如 "3041565")
        fcl: string; // 地理类别 (例如 "A")
        population: number; // 人口数量 (例如 24211)
        countryCode: string; // Alpha-2 国家代码 (例如 "AD")
        name: string; // 子分区名称 (例如 "Andorra la Vella")
        fclName: string; // 类别名称 (例如 "country, state, region,...")
        adminCodes1?: {
            ISO3166_2?: string; // 子分区 ISO 3166-2 代码 (例如 "07")
        };
        countryName: string; // 国家名称 (例如 "Andorra")
        fcodeName: string; // 地理细分类别名称 (例如 "first-order administrative division")
        adminName1: string; // 子分区行政名称 (例如 "Andorra la Vella")
        lat: string; // 纬度 (例如 "42.5045")
        fcode: string; // 地理细分类别代码 (例如 "ADM1")
    }[]
}

interface CountryInfo
{
    id: number; // ID (e.g., 1)
    alpha2: string; // Alpha-2 Code (e.g., 'GD')
    alpha3: string; // Alpha-3 Code (e.g., 'GRD')
    countryName: string; // Country Name (e.g., 'Grenada')
    geonameId: number; // GeoNames ID (e.g., 3577815)
    isoNumeric: string

}

