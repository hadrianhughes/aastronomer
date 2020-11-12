import math
from astro.astro import get_object, get_all_objects

expected_greenwich_2000 = [
    ('mercury', { 'alt': -62, 'az': 17 }),
    ('venus', { 'alt': -43, 'az': 59 }),
    ('mars', { 'alt': -34, 'az': 294 }),
    ('jupiter', { 'alt': 15, 'az': 264 }),
    ('saturn', { 'alt': 27, 'az': 254 }),
    ('uranus', { 'alt': -44, 'az': 305 }),
    ('neptune', { 'alt': -52, 'az': 318 })
]

greenwich_lat_long = (51.4934, 0.0098)
datetime_2000 = '2000-01-01 00:00'

def test_get_object():
    for (objName, position) in expected_greenwich_2000:
        result = get_object(objName, greenwich_lat_long, datetime_2000)
        assert math.modf(result['alt'])[1] == position['alt']
        assert math.modf(result['az'])[1] == position['az']


def test_get_all_objects():
    result = get_all_objects(greenwich_lat_long, datetime_2000)
    expected_dict = { objName: position
                      for (objName, position)
                      in expected_greenwich_2000 }

    for item in result:
        expected_item = expected_dict[item['object']]
        assert math.modf(item['alt'])[1] == expected_item['alt']
        assert math.modf(item['az'])[1] == expected_item['az']
