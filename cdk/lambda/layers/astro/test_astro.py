from astro import get_object, get_all_objects, direction_from_azimuth

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
        assert int(result['alt']) == position['alt']
        assert int(result['az']) == position['az']


def test_get_all_objects():
    result = get_all_objects(greenwich_lat_long, datetime_2000)

    for (objName, position) in expected_greenwich_2000:
        assert int(result[objName]['alt']) == position['alt']
        assert int(result[objName]['az']) == position['az']


def test_direction_from_azimuth_invalid():
    assert direction_from_azimuth(-1) == None
    assert direction_from_azimuth(370) == None

def test_direction_from_azimuth():
    assert direction_from_azimuth(337.5) == 'N'
    assert direction_from_azimuth(0) == 'N'
    assert direction_from_azimuth(22.5) == 'N'

    assert direction_from_azimuth(22.6) == 'NE'
    assert direction_from_azimuth(45) == 'NE'
    assert direction_from_azimuth(67.4) == 'NE'

    assert direction_from_azimuth(67.5) == 'E'
    assert direction_from_azimuth(90) == 'E'
    assert direction_from_azimuth(112.5) == 'E'

    assert direction_from_azimuth(112.6) == 'SE'
    assert direction_from_azimuth(135) == 'SE'
    assert direction_from_azimuth(157.4) == 'SE'

    assert direction_from_azimuth(157.5) == 'S'
    assert direction_from_azimuth(180) == 'S'
    assert direction_from_azimuth(202.5) == 'S'

    assert direction_from_azimuth(202.6) == 'SW'
    assert direction_from_azimuth(225) == 'SW'
    assert direction_from_azimuth(247.4) == 'SW'

    assert direction_from_azimuth(247.5) == 'W'
    assert direction_from_azimuth(270) == 'W'
    assert direction_from_azimuth(292.5) == 'W'

    assert direction_from_azimuth(292.6) == 'NW'
    assert direction_from_azimuth(315) == 'NW'
    assert direction_from_azimuth(337.4) == 'NW'
