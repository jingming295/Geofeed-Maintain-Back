export interface ASNData
{
    asn: {
        asName: string;
        asNumber: string;
        prefixCount: number;
        prefixCountWithGeo: number;
        status: boolean;
    }
}

export interface AnnouncedPrefixesFromRile
{
    messages: string[];
    see_also: string[];
    version: string;
    data_call_name: string;
    data_call_status: string;
    cached: boolean;
    data: Data;
    query_id: string;
    process_time: number;
    server_id: string;
    build_version: string;
    status: string;
    status_code: number;
    time: string;
}

interface Data
{
    prefixes: Prefix[];
    query_starttime: string;
    query_endtime: string;
    resource: string;
    latest_time: string;
    earliest_time: string;
}

interface Prefix
{
    prefix: string;
    timelines: Timeline[];
}

interface Timeline
{
    starttime: string;
    endtime: string;
}
