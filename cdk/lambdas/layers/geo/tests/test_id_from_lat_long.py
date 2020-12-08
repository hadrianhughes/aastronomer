from geo import id_from_lat_long

def test_out_of_bounds():
    assert id_from_lat_long(91, 190) == None
    assert id_from_lat_long(-91, -190) == None


def test_equator():
    assert id_from_lat_long(0, 0) == '90-0-0-0'


def test_edinburgh():
    assert id_from_lat_long(55.9, -3.2) == '35-356-5-6'
