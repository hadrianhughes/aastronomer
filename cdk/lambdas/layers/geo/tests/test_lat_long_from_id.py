from ..geo import lat_long_from_id

def test_out_of_bounds():
    assert lat_long_from_id('0-0-0-7') == None
    assert lat_long_from_id('0-0-12-0') == None


def test_equator():
    (lat, long) = lat_long_from_id('90-0-0-0')
    assert round(lat, 3) == 0.071
    assert round(long, 3) == 0.042


def test_edinburgh():
    (lat, long) = lat_long_from_id('35-356-5-6')
    assert round(lat, 1) == 55.9
    assert round(long, 1) == -3.2
