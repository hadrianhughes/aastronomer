from datetime import datetime
from astro import get_all_objects

def get_visible_handler(event: dict, context: dict):
    params = event['pathParameters']

    lat_long = (float(params['latitude']), float(params['longitude']))
    date_string = datetime.now(tz=None).strftime('%Y-%m-%d %H:%M')

    print('get_all_objects(' + str(lat_long) + ', ' + date_string + ')')
    results = get_all_objects(lat_long, date_string)

    return {
        'statusCode': 200,
        'body': str(results)
    }
