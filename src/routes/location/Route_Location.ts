import { Application } from "express";
import { Routes } from "../Routes";
import { Request } from "express";
import { CommonResponse } from "@/types/CommonResponse";
import { ReturnCode } from "@/utils/ReturnCode";
import { SQSelect } from "@/SQ/SQSelect";
import { CountryDataResponse } from "@/types/CountryData";
import { UpdatePrefixData } from "@/types/Prefix";
import { SQUpdate } from "@/SQ/SQUpdate";
import { SQInsert } from "@/SQ/SQInsert";

export class Route_Location extends Routes
{
    static routeName = "/location";
    public static setRoute(app: Application): void
    {
        app.post(`${this.routeName}/getcountry`, (req, res) => this.middleware(req, res, this.getCountryList));
        app.post(`${this.routeName}/getsubdivision`, (req, res) => this.middleware(req, res, this.getSubDivisionByCountry));
        app.post(`${this.routeName}/getcity`, (req, res) => this.middleware(req, res, this.getCityByCountryOrSubdivision));
        app.post(`${this.routeName}/getzipcode`, (req, res) => this.middleware(req, res, this.getZipCodeByCity));
        app.post(`${this.routeName}/updateprefixlocation`, (req, res) => this.middleware(req, res, this.updatePrefixLocation));

    }

    private static getCountryList = async (req: Request): Promise<CommonResponse<CountryDataResponse[]>> =>
    {

        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const country = await SQSelect.geolocation.getCountryList();

        if (country.error)
        {
            return {
                code: ReturnCode('ISE'),
                message: country.message,
            }
        }
        if (!country.data)
        {
            return {
                code: ReturnCode('NotFound'),
                message: "No country data found",
            }
        }

        const countryData: CountryDataResponse[] = country.data.map((item) => ({
            id: item.id,
            name: `${item.alpha_3_code} - ${item.name}`,
        }))


        return {
            code: ReturnCode('OPSuccess'),
            message: "Success",
            data: countryData,
        }


    }

    private static getSubDivisionByCountry = async (req: Request): Promise<CommonResponse<CountryDataResponse[]>> =>
    {
        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const countryID = Number(req.body.countryID);

        if (!countryID) return {
            code: ReturnCode('NotFound'),
            message: "No country data found",
        }

        const subdivision = await SQSelect.geolocation.getSubDivisionByCountry(countryID);

        const country = await SQSelect.geolocation.getCountryByID(countryID);

        if (country.error)
        {
            return {
                code: ReturnCode('ISE'),
                message: country.message,
            }
        }

        if (!country.data)
        {
            return {
                code: ReturnCode('NotFound'),
                message: "No country data found",
            }
        }

        const alpha2 = country.data.alpha_2_code

        if (subdivision.error)
        {
            return {
                code: ReturnCode('ISE'),
                message: subdivision.message,
            }
        }
        if (!subdivision.data)
        {
            return {
                code: ReturnCode('NotFound'),
                message: "No country data found",
            }
        }
        const subdivisionData: CountryDataResponse[] = subdivision.data.map((item) => ({
            id: item.id,
            name: `${alpha2}-${item.code_3166_2}`,
        }))


        return {
            code: ReturnCode('OPSuccess'),
            message: "Success",
            data: subdivisionData,
        }


    }

    private static getCityByCountryOrSubdivision = async (req: Request): Promise<CommonResponse<CountryDataResponse[]>> =>
    {
        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const countryID = Number(req.body.countryID) || undefined;
        const subdivisionID = Number(req.body.subdivisionID) || undefined;

        if (subdivisionID)
        {
            const city = await SQSelect.geolocation.getCityBySubdivisionID(subdivisionID);

            if (city.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: city.message,
                }
            }

            if (!city.data)
            {
                return {
                    code: ReturnCode('NotFound'),
                    message: "No country data found",
                }
            }

            const cityData: CountryDataResponse[] = city.data.map((item) => ({
                id: item.id,
                name: `${item.name}`,
            }))

            return {
                code: ReturnCode('OPSuccess'),
                message: "Success",
                data: cityData,
            }
        }

        if (countryID)
        {
            const city = await SQSelect.geolocation.getCityByCountryID(countryID);

            if (city.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: city.message,
                }
            }

            if (!city.data)
            {
                return {
                    code: ReturnCode('NotFound'),
                    message: "No country data found",
                }
            }

            const cityData: CountryDataResponse[] = city.data.map((item) => ({
                id: item.id,
                name: `${item.name}`,
            }))

            return {
                code: ReturnCode('OPSuccess'),
                message: "Success",
                data: cityData,
            }
        }

        return {
            code: ReturnCode('NotFound'),
            message: "No country data found",
        }
    }

    private static getZipCodeByCity = async (req: Request): Promise<CommonResponse<CountryDataResponse[]>> =>
    {
        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const cityID = Number(req.body.cityID) || undefined;

        if (!cityID) return {
            code: ReturnCode('NotFound'),
            message: "No country data found",
        }

        const zipCode = await SQSelect.geolocation.getZipCodeByCityID(cityID);

        if (zipCode.error)
        {
            return {
                code: ReturnCode('ISE'),
                message: zipCode.message,
            }
        }

        if (!zipCode.data)
        {
            return {
                code: ReturnCode('NotFound'),
                message: "No country data found",
            }
        }

        const zipCodeData: CountryDataResponse[] = zipCode.data.map((item) => ({
            id: item.id,
            name: `${item.name}`,
        }))

        return {
            code: ReturnCode('OPSuccess'),
            message: "Success",
            data: zipCodeData,
        }


    }

    private static updatePrefixLocation = async (req: Request): Promise<CommonResponse<CountryDataResponse[]>> =>
    {
        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }
        const id = Number(req.body.id) || undefined;
        const countryID = Number(req.body.countryid) || undefined;
        const subdivisionID = Number(req.body.subdivisionsid) || undefined;
        const cityID = Number(req.body.cityid) || undefined;
        const cityName = req.body.cityname as string || undefined;
        const zipcodeID = Number(req.body.zipcodeid) || undefined;
        const zipcodeName = req.body.zipcodename as string || undefined;

        if (!id) return {
            code: ReturnCode('NotFound'),
            message: "No prefix data found",
        }

        const prefixIDResult = await SQSelect.prefix.getPrefixById(id, userdata.id);

        if (prefixIDResult.error)
        {
            return {
                code: ReturnCode('ISE'),
                message: prefixIDResult.message,
            }
        }

        if (!prefixIDResult.data)
        {
            return {
                code: ReturnCode('NotFound'),
                message: "No prefix data found",
            }
        }

        const prefixID = prefixIDResult.data.id

        const updatePrefixData: UpdatePrefixData = {
            prefixID: prefixID,
            countryid: countryID || null,
            subdivisionsid: subdivisionID || null,
            city: {
                id: cityID || null,
                name: cityName || null,
            },
            zipCode: {
                id: zipcodeID || null,
                name: zipcodeName || null,
            }
        }

        if (!updatePrefixData.countryid)
        {
            updatePrefixData.countryid = null;
            updatePrefixData.subdivisionsid = null;
            updatePrefixData.city.id = null;
            updatePrefixData.city.name = null;
            updatePrefixData.zipCode.id = null;
            updatePrefixData.zipCode.name = null;
        } else if (!updatePrefixData.city.id)
        {
            updatePrefixData.zipCode.id = null;
            updatePrefixData.zipCode.name = null;
        }

        if (updatePrefixData.subdivisionsid && updatePrefixData.countryid)
        {
            const subdivitionResult = await SQSelect.geolocation.validateSubdivision(updatePrefixData.subdivisionsid, updatePrefixData.countryid);

            if (subdivitionResult.error)
            {
                return {
                    code: ReturnCode('InvalidValue'),
                    message: 'Invalid subdivision value',
                }
            }
        }

        // if -1 means add new item
        if (updatePrefixData.city.id === -1 && updatePrefixData.city.name)
        {
            const cityResult = await SQSelect.geolocation.checkCityNameExist(updatePrefixData.city.name, updatePrefixData.countryid, updatePrefixData.subdivisionsid);

            if (cityResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: cityResult.message,
                }
            }

            if (cityResult.data)
            {
                updatePrefixData.city.id = cityResult.data.id;
                updatePrefixData.city.name = null;
            }
        }

        if (updatePrefixData.city.id && updatePrefixData.city.id > 0)
        {
            const cityResult = await SQSelect.geolocation.validateCityID(updatePrefixData.city.id, updatePrefixData.countryid, updatePrefixData.subdivisionsid);

            if (cityResult.error)
            {
                return {
                    code: ReturnCode('InvalidValue'),
                    message: 'Invalid city value',
                }
            }
        }

        const updateCountryResult = await SQUpdate.prefix.updatePrefixCountry(updatePrefixData.prefixID, updatePrefixData.countryid);

        if (updateCountryResult.error)
        {
            return {
                code: ReturnCode('ISE'),
                message: updateCountryResult.message,
            }
        }

        if (updatePrefixData.countryid)
        {
            const updateSubdivitionResult = await SQUpdate.prefix.updatePrefixSubdivitionByIdAndCountryID(updatePrefixData.prefixID, updatePrefixData.subdivisionsid, updatePrefixData.countryid);

            if (updateSubdivitionResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: updateSubdivitionResult.message,
                }
            }

        }

        if (updatePrefixData.city.id === -1 && updatePrefixData.city.name && updatePrefixData.countryid)
        {
            const insertCityResult = await SQInsert.location.insertNewCity(updatePrefixData.city.name, updatePrefixData.countryid, updatePrefixData.subdivisionsid);

            if (insertCityResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: insertCityResult.message,
                }
            }

            if (insertCityResult.data)
            {
                updatePrefixData.city.id = insertCityResult.data.id;
                updatePrefixData.city.name = null;
            }

        }
        if (updatePrefixData.city.id && updatePrefixData.countryid)
        {
            const updateCityResult = await SQUpdate.prefix.updatePrefixCityID(updatePrefixData.prefixID, updatePrefixData.city.id);

            if (updateCityResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: updateCityResult.message,
                }
            }

        } else if (updatePrefixData.city.id === null)
        {
            const updateCityResult = await SQUpdate.prefix.updatePrefixCityID(updatePrefixData.prefixID, null);

            if (updateCityResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: updateCityResult.message,
                }
            }
        }

        // if -1 means add new item
        if (updatePrefixData.zipCode.id === -1 && updatePrefixData.zipCode.name && updatePrefixData.city.id)
        {
            const zipCodeResult = await SQSelect.geolocation.checkZipCodeNameExist(updatePrefixData.zipCode.name, updatePrefixData.city.id);

            if (zipCodeResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: zipCodeResult.message,
                }
            }

            if (zipCodeResult.data)
            {
                updatePrefixData.zipCode.id = zipCodeResult.data.id;
                updatePrefixData.zipCode.name = null;
            }
        }

        if (updatePrefixData.zipCode.id && updatePrefixData.city.id)
        {
            const zipCodeResult = await SQSelect.geolocation.validateZipCodeID(updatePrefixData.zipCode.id, updatePrefixData.city.id);

            if (zipCodeResult.error)
            {
                return {
                    code: ReturnCode('InvalidValue'),
                    message: 'Invalid zipcode value',
                }
            }
        }
        if (updatePrefixData.zipCode.id === -1 && updatePrefixData.zipCode.name && updatePrefixData.city.id)
        {
            const insertZipCodeResult = await SQInsert.location.insertNewZipCode(updatePrefixData.zipCode.name, updatePrefixData.city.id);

            if (insertZipCodeResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: insertZipCodeResult.message,
                }
            }

            if (insertZipCodeResult.data)
            {
                updatePrefixData.zipCode.id = insertZipCodeResult.data.id;
                updatePrefixData.zipCode.name = null;
            }

        }

        if (updatePrefixData.zipCode.id && updatePrefixData.city.id)
        {
            const updateZipCodeResult = await SQUpdate.prefix.updatePrefixZipCodeID(updatePrefixData.prefixID, updatePrefixData.zipCode.id);

            if (updateZipCodeResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: updateZipCodeResult.message,
                }
            }

        } else if (updatePrefixData.zipCode.id === null)
        {
            const updateZipCodeResult = await SQUpdate.prefix.updatePrefixZipCodeID(updatePrefixData.prefixID, null);

            if (updateZipCodeResult.error)
            {
                return {
                    code: ReturnCode('ISE'),
                    message: updateZipCodeResult.message,
                }
            }
        }





        console.log(updatePrefixData)

        return {
            code: ReturnCode('OPFailed'),
            message: "Success",
            data: undefined,
        }


    }




}