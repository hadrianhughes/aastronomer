import math
import json
from datetime import datetime
from astro import get_all_objects

def get_visible_handler(event: dict, context: dict):
    params = event['pathParameters']

    latitude = float(params['latitude'])
    longitude = float(params['longitude'])

    lat_long = (math.modf(latitude)[1], math.modf(longitude)[1])
    date_string = datetime.now(tz=None).strftime('%Y-%m-%d %H:%M')

    results = get_all_objects(lat_long, date_string)

    visible_results = { obj: pos
                        for (obj, pos) in results.items()
                        if results[obj]['alt'] > 0 }

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(visible_results)
    }
