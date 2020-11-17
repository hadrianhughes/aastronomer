import json
from datetime import datetime
from astro import get_all_objects, direction_from_azimuth
from common import make_response

def get_visible_lat_long(latitude: float, longitude: float):
    lat_long = (int(latitude), int(longitude))
    date_string = datetime.now(tz=None).strftime('%Y-%m-%d %H:%M')

    results = get_all_objects(lat_long, date_string)

    visible_results = { obj: { **pos, 'ordinal': direction_from_azimuth(pos['az']) }
                        for (obj, pos) in results.items()
                        if results[obj]['alt'] > 0 }

    return visible_results


def handler(event: dict, context: dict):
    params = event['pathParameters']

    latitude = float(params['latitude'])
    longitude = float(params['longitude'])

    if latitude < -90 or latitude > 90:
        return make_response(400, { 'message': 'Latitude must be between -90 and 90 degrees' })

    if longitude < -180 or longitude > 180:
        return make_response(400, { 'message': 'Longitude must be between -180 and 180 degrees' })

    visible_results = get_visible_lat_long(latitude, longitude)

    response_body = {
        'latitude': int(latitude),
        'longitude': int(longitude),
        'visible': visible_results
    }

    return make_response(200, response_body)
