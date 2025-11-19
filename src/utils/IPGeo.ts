import maxmind from 'maxmind';

export class IPGeo
{

    public static async lookupIPGeoFromMaxmind(ip: string)
    {
        const lookup = await maxmind.open('./data/maxmind/GeoLite2-City.mmdb');
        const geo = lookup.get(ip);

        return geo as GeoLite2CityResult
    }
}
