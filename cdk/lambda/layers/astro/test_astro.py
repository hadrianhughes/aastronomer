import math
from astro.astro import get_object

expected_greenwich_2000 = [
    ('mercury', { 'alt': -62, 'az': 17 }),
    ('venus', { 'alt': -43, 'az': 59 }),
    ('mars', { 'alt': -34, 'az': 294 }),
    ('jupiter', { 'alt': 15, 'az': 264 }),
    ('saturn', { 'alt': 27, 'az': 254 }),
    ('uranus', { 'alt': -44, 'az': 305 }),
    ('neptune', { 'alt': -52, 'az': 318 })
]

def test_get_object():
    for (objName, position) in expected_greenwich_2000:
        result = get_object(objName, (51.4934, 0.0098), '2000-01-01 00:00')
        assert math.modf(result['alt'])[1] == position['alt']
        assert math.modf(result['az'])[1] == position['az']
