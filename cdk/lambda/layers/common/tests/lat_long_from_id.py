from common import lat_long_from_id

def test_all_zero():
    (lat, long) = lat_long_from_id('0-0-0-0')

    assert lat == 90
    assert long == 0
